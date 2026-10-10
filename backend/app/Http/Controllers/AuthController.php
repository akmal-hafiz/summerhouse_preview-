<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\AssetUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Support\LodgifyLog as SafeLog;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AuthController extends Controller
{
    /** Neutral response, independent of whether the account exists. */
    public function lookup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        return response()->json(['success' => true, 'message' => 'Continue to log in or create an account.']);
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
            SafeLog::write('notice', 'auth.login_denied', 'Customer authentication denied.', ['reason' => 'invalid_credentials']);
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        $token = $user->createToken('auth', ['*'], now()->addDays(7))->plainTextToken;
        SafeLog::write('info', 'auth.login_succeeded', 'Customer authentication succeeded.', ['user_id' => $user->id]);

        return response()->json([
            'success' => true,
            'user' => self::serializeUser($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        SafeLog::write('info', 'auth.session_revoked', 'Customer session revoked.', ['user_id' => $request->user()?->id]);

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

    public function uploadAvatar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'avatar' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
        ]);

        $file = $data['avatar'];
        $dimensions = @getimagesize($file->getRealPath());
        if (!$dimensions || $dimensions[0] > 4096 || $dimensions[1] > 4096 || $dimensions[0] * $dimensions[1] > 12000000) {
            throw ValidationException::withMessages(['avatar' => 'Image dimensions are too large or invalid.']);
        }

        try {
            $image = (new ImageManager(new Driver()))->read($file->getRealPath())->orient()->cover(320, 320);
            $bytes = (string) $image->toWebp(quality: (int) config('media.webp_quality', 82));
        } catch (\Throwable $exception) {
            throw ValidationException::withMessages(['avatar' => 'The image could not be processed.']);
        }

        $user = $request->user();
        $path = 'uploads/profiles/user-' . $user->id . '/' . Str::uuid() . '.webp';
        $disk = Storage::disk('public');
        if (!$disk->put($path, $bytes)) {
            return response()->json(['success' => false, 'message' => 'Could not save the photo. Please try again.'], 503);
        }

        $previous = $user->avatar_path;
        try {
            $user->update(['avatar_path' => $path]);
        } catch (\Throwable $exception) {
            $disk->delete($path);
            throw $exception;
        }

        if ($previous && str_starts_with($previous, 'uploads/profiles/user-' . $user->id . '/')) {
            $disk->delete($previous);
        }

        return response()->json(['success' => true, 'user' => self::serializeUser($user->fresh())]);
    }

    public function removeAvatar(Request $request): JsonResponse
    {
        $user = $request->user();
        $previous = $user->avatar_path;
        $user->update(['avatar_path' => null]);
        if ($previous && str_starts_with($previous, 'uploads/profiles/user-' . $user->id . '/')) {
            Storage::disk('public')->delete($previous);
        }

        return response()->json(['success' => true, 'user' => self::serializeUser($user->fresh())]);
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
            'avatarUrl' => AssetUrl::resolve($user->avatar_path),
        ];
    }
}
