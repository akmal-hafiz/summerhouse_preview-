<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterSubscriberController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email:rfc|max:190',
            'consent' => 'required|accepted',
            'source' => 'nullable|string|max:80',
        ]);

        NewsletterSubscriber::updateOrCreate(
            ['email' => mb_strtolower(trim($data['email']))],
            [
                'is_active' => true,
                'consent_at' => now(),
                'unsubscribed_at' => null,
                'source' => $data['source'] ?? 'footer',
            ],
        );

        return response()->json([
            'success' => true,
            'message' => 'You are on the Summerhouse Journal list.',
        ], 201);
    }
}
