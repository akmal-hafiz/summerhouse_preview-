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

class OtpController extends Controller
{
    private const OTP_TTL_MINUTES = 10;
    private const MAX_ATTEMPTS = 5;

    public function sendRegistrationOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
        ]);

        // Invalidate previous unused registration OTPs for this email
        OtpCode::forEmail($data['email'])
            ->ofType(OtpCode::TYPE_REGISTRATION)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $code = (string) random_int(100000, 999999);

        OtpCode::create([
            'email' => $data['email'],
            'type' => OtpCode::TYPE_REGISTRATION,
            'code' => $code,
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        try {
            Mail::mailer('resend')->to($data['email'])->send(new OtpMail($code, $data['name']));
        } catch (\Throwable $e) {
            Log::error('Failed to send OTP email', [
                'email' => $data['email'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email OTP. Coba lagi nanti.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP code sent to your email.',
            'expires_in' => self::OTP_TTL_MINUTES * 60,
        ]);
    }

    public function verifyRegistrationOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $otp = OtpCode::forEmail($data['email'])
            ->ofType(OtpCode::TYPE_REGISTRATION)
            ->valid()
            ->latest()
            ->first();

        if (!$otp) {
            throw ValidationException::withMessages([
                'code' => 'Kode OTP tidak valid atau sudah kadaluarsa.',
            ]);
        }

        $otp->increment('attempts');

        if ($otp->code !== $data['code']) {
            $remaining = self::MAX_ATTEMPTS - $otp->attempts;
            throw ValidationException::withMessages([
                'code' => $remaining > 0
                    ? "Kode OTP salah. Sisa percobaan: {$remaining}."
                    : 'Kode OTP salah. Silakan minta kode baru.',
            ]);
        }

        $otp->update(['used_at' => now()]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => AuthController::serializeUser($user),
            'token' => $token,
        ], 201);
    }
}
