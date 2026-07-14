<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicOwnerTestimonialRequest;
use App\Services\Reviews\ReviewService;
use Illuminate\Http\JsonResponse;

class OwnerTestimonialController extends Controller
{
    public function store(PublicOwnerTestimonialRequest $request, ReviewService $service): JsonResponse
    {
        try {
            $service->submitOwnerTestimonial($request->toTestimonialPayload());
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'We could not save your testimonial. Please try again shortly.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you. Our team will review your testimonial before it goes live.',
        ], 202);
    }
}
