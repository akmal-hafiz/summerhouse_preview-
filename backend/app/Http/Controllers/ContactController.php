<?php

namespace App\Http\Controllers;

use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:200',
            'message' => 'required|string|max:5000',
            'villa_interest' => 'nullable|string|max:200',
        ]);

        $submission = ContactSubmission::create($data);

        return response()->json([
            'success' => true,
            'id' => $submission->id,
            'message' => 'Thanks. We will reach out within 2 hours.',
        ], 201);
    }
}
