<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class OtpCode extends Model
{
    public const TYPE_REGISTRATION = 'registration';
    public const TYPE_PASSWORD_RESET = 'password_reset';

    protected $fillable = [
        'email',
        'type',
        'code',
        'code_hash',
        'attempts',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'attempts' => 'integer',
    ];

    protected $hidden = ['code', 'code_hash'];

    public static function digest(string $code): string
    {
        if (strlen((string) config('app.key')) < 32) throw new \RuntimeException('OTP signing key is unavailable');
        return hash_hmac('sha256', $code, (string) config('app.key'));
    }

    /** Invalid attempts must commit before the caller raises a validation error. */
    public static function consume(string $email, string $type, string $code, callable $onSuccess): mixed
    {
        return DB::transaction(function () use ($email, $type, $code, $onSuccess) {
            $otp = static::forEmail($email)->ofType($type)->valid()
                ->latest('id')->lockForUpdate()->first();

            if (!$otp || !$otp->code_hash) {
                return null;
            }

            $otp->increment('attempts');
            if (!hash_equals($otp->code_hash, static::digest($code))) {
                return null;
            }

            $otp->update(['used_at' => now()]);
            return $onSuccess();
        }, 3);
    }

    public function scopeValid(Builder $query): Builder
    {
        return $query
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->where('attempts', '<', 5);
    }

    public function scopeForEmail(Builder $query, string $email): Builder
    {
        return $query->where('email', $email);
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }
}
