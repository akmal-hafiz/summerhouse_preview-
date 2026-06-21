<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect user to Google's OAuth consent page.
     * Frontend should hit GET /api/v1/auth/google/redirect?redirect=/some-path
     * The `redirect` query param is preserved in the OAuth state so we can
     * send the user back to where they started after auth.
     */
    public function redirect(Request $request)
    {
        // Stash the final-destination path in the session via OAuth state.
        $finalRedirect = $request->query('redirect', '/');

        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => base64_encode($finalRedirect)])
            ->redirect();
    }

    /**
     * Google callback handler.
     * Provisions or finds the user, mints a Sanctum token, and redirects to
     * the Next.js frontend with the token + user payload in the URL fragment.
     * Frontend reads the fragment, persists the token, then strips it.
     */
    public function callback(Request $request)
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable $e) {
            return redirect($frontendUrl . '/login?error=' . urlencode('Google sign-in failed. Please try again.'));
        }

        $email = $googleUser->getEmail();
        if (!$email) {
            return redirect($frontendUrl . '/login?error=' . urlencode('Google account has no email.'));
        }

        $user = User::firstOrNew(['email' => $email]);

        if (!$user->exists) {
            $user->name = $googleUser->getName() ?: $googleUser->getNickname() ?: explode('@', $email)[0];
            $user->password = Hash::make(Str::random(32));
            $user->email_verified_at = now();
            $user->role = 'user';
        }

        $user->save();

        $token = $user->createToken('google-oauth')->plainTextToken;

        // Decode redirect path from state.
        $state = $request->query('state', '');
        $redirectPath = '/';
        try {
            $decoded = base64_decode($state, true);
            if ($decoded && str_starts_with($decoded, '/')) {
                $redirectPath = $decoded;
            }
        } catch (\Throwable $e) {
            // ignore — fall back to '/'
        }

        $payload = base64_encode(json_encode([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'isAdmin' => $user->role === 'admin',
            ],
        ]));

        // Pass token via URL fragment so it never lands in server access logs.
        return redirect($frontendUrl . '/auth/google/complete?next=' . urlencode($redirectPath) . '#payload=' . $payload);
    }
}
