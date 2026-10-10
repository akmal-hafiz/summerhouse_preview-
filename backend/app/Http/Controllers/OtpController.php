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

        $otp = OtpCode::create([
            'email' => $data['email'],
            'type' => OtpCode::TYPE_REGISTRATION,
            'code' => '******',
            'code_hash' => OtpCode::digest($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
        ]);

        try {
            if (app()->environment('production') && in_array(config('mail.default'), ['array', 'log', 'failover'], true)) throw new \RuntimeException('OTP delivery transport is unavailable');
            Mail::to($data['email'])->send(new OtpMail($code, $data['name']));
        } catch (\Throwable $e) {
            $otp->update(['used_at' => now()]);
            SafeLog::write('warning', 'auth.otp_delivery_failed', 'Verification email delivery failed.', ['type' => 'registration', 'exception_type' => get_class($e)]);

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

        $result = OtpCode::consume($data['email'], OtpCode::TYPE_REGISTRATION, $data['code'], function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'user',
            ]);

            return ['user' => $user, 'token' => $user->createToken('auth', ['*'], now()->addDays(7))->plainTextToken];
        });

        if (!$result) {
            throw ValidationException::withMessages([
                'code' => 'Kode OTP tidak valid atau sudah kadaluarsa.',
            ]);
        }

        return response()->json([
            'success' => true,
            'user' => AuthController::serializeUser($result['user']),
            'token' => $result['token'],
        ], 201);
    }
}
