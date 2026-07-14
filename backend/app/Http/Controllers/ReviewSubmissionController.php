<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicReviewSubmissionRequest;
use App\Services\Reviews\ReviewService;
use Illuminate\Http\JsonResponse;

class ReviewSubmissionController extends Controller
{
    public function store(PublicReviewSubmissionRequest $request, ReviewService $service): JsonResponse
    {
        try {
            $service->submitGuestReview($request->toReviewPayload());
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'We could not save your review. Please try again shortly.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you. Your review is with our team for review before publication.',
        ], 202);
    }
}
