<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ids = Wishlist::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->pluck('lodgify_property_id')
            ->map(fn ($id) => (string) $id)
            ->values();

        return response()->json([
            'success' => true,
            'ids' => $ids,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lodgify_property_id' => 'required|string|max:20|regex:/^[0-9]+$/',
        ]);

        Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'lodgify_property_id' => $data['lodgify_property_id'],
        ]);

        return response()->json(['success' => true], 201);
    }

    public function destroy(Request $request, string $lodgifyPropertyId): JsonResponse
    {
        if (!preg_match('/^[0-9]+$/', $lodgifyPropertyId)) {
            return response()->json(['success' => false, 'error' => 'Invalid villa id.'], 400);
        }

        Wishlist::where('user_id', $request->user()->id)
            ->where('lodgify_property_id', $lodgifyPropertyId)
            ->delete();

        return response()->json(['success' => true]);
    }

    public function sync(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => 'required|array|max:200',
            'ids.*' => 'string|max:20|regex:/^[0-9]+$/',
        ]);

        $userId = $request->user()->id;
        $existing = Wishlist::where('user_id', $userId)->pluck('lodgify_property_id')->toArray();
        $newIds = array_diff($data['ids'], $existing);

        foreach ($newIds as $id) {
            Wishlist::firstOrCreate([
                'user_id' => $userId,
                'lodgify_property_id' => $id,
            ]);
        }

        $allIds = Wishlist::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->pluck('lodgify_property_id')
            ->map(fn ($id) => (string) $id)
            ->values();

        return response()->json([
            'success' => true,
            'ids' => $allIds,
            'merged' => count($newIds),
        ]);
    }
}

