<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    private const OTP_TTL_MINUTES = 15;
    private const MAX_ATTEMPTS = 5;

    public function sendResetOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        // Always respond with success to avoid leaking which emails exist.
        $genericResponse = response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, kode reset password telah dikirim.',
            'expires_in' => self::OTP_TTL_MINUTES * 60,
        ]);

        if (!$user) {
            return $genericResponse;
        }

        OtpCode::forEmail($data['email'])
            ->ofType(OtpCode::TYPE_PASSWORD_RESET)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $code = (string) random_int(100000, 999999);

        OtpCode::create([
            'email' => $data['email'],
            'type' => OtpCode::TYPE_PASSWORD_RESET,
            'code' => $code,
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        try {
            Mail::mailer('resend')->to($data['email'])->send(new OtpMail($code, $user->name, 'password_reset'));
        } catch (\Throwable $e) {
            Log::error('Failed to send password reset OTP', [
                'email' => $data['email'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email. Coba lagi nanti.',
            ], 500);
        }

        return $genericResponse;
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'code' => 'Kode reset tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $otp = OtpCode::forEmail($data['email'])
            ->ofType(OtpCode::TYPE_PASSWORD_RESET)
            ->valid()
            ->latest()
            ->first();

        if (!$otp) {
            throw ValidationException::withMessages([
                'code' => 'Kode reset tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $otp->increment('attempts');

        if ($otp->code !== $data['code']) {
            $remaining = self::MAX_ATTEMPTS - $otp->attempts;
            throw ValidationException::withMessages([
                'code' => $remaining > 0
                    ? "Kode reset salah. Sisa percobaan: {$remaining}."
                    : 'Kode reset salah. Silakan minta kode baru.',
            ]);
        }

        $otp->update(['used_at' => now()]);

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        // Revoke all Sanctum tokens to force re-login on every device
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui. Silakan masuk dengan password baru.',
        ]);
    }
}
