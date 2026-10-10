<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Support\LodgifyLog as SafeLog;
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

        $otp = OtpCode::create([
            'email' => $data['email'],
            'type' => OtpCode::TYPE_PASSWORD_RESET,
            'code' => '******',
            'code_hash' => OtpCode::digest($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        try {
            if (app()->environment('production') && in_array(config('mail.default'), ['array', 'log', 'failover'], true)) throw new \RuntimeException('OTP delivery transport is unavailable');
            Mail::to($data['email'])->send(new OtpMail($code, $user->name, 'password_reset'));
        } catch (\Throwable $e) {
            $otp->update(['used_at' => now()]);
            SafeLog::write('warning', 'auth.otp_delivery_failed', 'Verification email delivery failed.', ['type' => 'password_reset', 'exception_type' => get_class($e)]);

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

        $result = OtpCode::consume($data['email'], OtpCode::TYPE_PASSWORD_RESET, $data['code'], function () use ($data, $user) {
            $user->update(['password' => Hash::make($data['password'])]);
            $user->tokens()->delete();
            return true;
        });

        if (!$result) {
            throw ValidationException::withMessages([
                'code' => 'Kode reset tidak valid atau sudah kadaluarsa.',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui. Silakan masuk dengan password baru.',
        ]);
    }
}
