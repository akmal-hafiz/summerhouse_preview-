<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Identifier lookup — Airbnb-style "Welcome back" step.
     *
     * Returns { exists, name?, masked_email? } for the given email. Always 200
     * to avoid exposing enumeration via status codes; rate-limited by route.
     */
    public function lookup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json(['exists' => false]);
        }

        $firstName = trim(explode(' ', (string) $user->name)[0] ?? $user->name);

        return response()->json([
            'exists' => true,
            'name' => $firstName !== '' ? $firstName : $user->name,
            'masked_email' => self::maskEmail($user->email),
        ]);
    }

    protected static function maskEmail(string $email): string
    {
        $atPos = strpos($email, '@');
        if ($atPos === false || $atPos < 1) {
            return $email;
        }
        $local = substr($email, 0, $atPos);
        $domain = substr($email, $atPos);
        if (strlen($local) <= 2) {
            return $local[0] . '***' . $domain;
        }
        return $local[0] . '***' . $local[strlen($local) - 1] . $domain;
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => self::serializeUser($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['success' => true]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => self::serializeUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update([
            'name' => $data['name'],
        ]);

        return response()->json([
            'success' => true,
            'user' => self::serializeUser($user->fresh()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Current password is incorrect.',
            ]);
        }

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        // Revoke all other tokens, keep current
        $currentTokenId = $request->user()->currentAccessToken()?->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password updated. Other devices have been signed out.',
        ]);
    }

    public static function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'isAdmin' => $user->role === 'admin',
        ];
    }
}
