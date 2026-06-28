<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        // OTP send: 3 per minute per email + 8 per hour per email, fallback IP for missing email
        RateLimiter::for('otp-send', function (Request $request) {
            $email = strtolower((string) $request->input('email')) ?: $request->ip();
            return [
                Limit::perMinute(3)->by('otp-send:min:' . $email),
                Limit::perHour(8)->by('otp-send:hour:' . $email),
                Limit::perHour(40)->by('otp-send:ip:' . $request->ip()),
            ];
        });

        // OTP verify: 8 attempts per minute per email, 30 per 10 minutes per email
        RateLimiter::for('otp-verify', function (Request $request) {
            $email = strtolower((string) $request->input('email')) ?: $request->ip();
            return [
                Limit::perMinute(8)->by('otp-verify:min:' . $email),
                Limit::perMinutes(10, 30)->by('otp-verify:10min:' . $email),
            ];
        });

        // Password reset send: 3/min, 6/hour per email
        RateLimiter::for('password-reset-send', function (Request $request) {
            $email = strtolower((string) $request->input('email')) ?: $request->ip();
            return [
                Limit::perMinute(3)->by('pw-reset-send:min:' . $email),
                Limit::perHour(6)->by('pw-reset-send:hour:' . $email),
            ];
        });

        // Password reset verify: 10/min per email
        RateLimiter::for('password-reset-verify', function (Request $request) {
            $email = strtolower((string) $request->input('email')) ?: $request->ip();
            return Limit::perMinute(10)->by('pw-reset-verify:' . $email);
        });
    }
}
