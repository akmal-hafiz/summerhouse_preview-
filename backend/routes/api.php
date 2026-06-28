<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CmsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\WishlistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('cms')->group(function () {
        Route::get('page/{page}', [CmsController::class, 'pageSections']);
        Route::get('page/{page}/section/{section}', [CmsController::class, 'pageSection']);
        Route::get('homepage/villa-selections', [CmsController::class, 'homepageVillaSelections']);
        Route::get('bali-collections', [CmsController::class, 'baliCollections']);
        Route::get('articles', [CmsController::class, 'articles']);
        Route::get('articles/{slug}', [CmsController::class, 'article']);
        Route::get('testimonials/{page}', [CmsController::class, 'testimonials']);
        Route::get('faqs/{page}', [CmsController::class, 'faqs']);
        Route::get('service-cards/{category}', [CmsController::class, 'serviceCards']);
        Route::get('gallery', [CmsController::class, 'gallery']);
        Route::get('settings', [CmsController::class, 'settingsBulk']);
        Route::get('settings/{key}', [CmsController::class, 'setting']);
    });

    Route::prefix('auth')->group(function () {
        Route::post('register/send-otp', [OtpController::class, 'sendRegistrationOtp'])->middleware('throttle:otp-send');
        Route::post('register/verify-otp', [OtpController::class, 'verifyRegistrationOtp'])->middleware('throttle:otp-verify');

        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:20,1');

        // Forgot password flow
        Route::post('password/forgot', [PasswordResetController::class, 'sendResetOtp'])->middleware('throttle:password-reset-send');
        Route::post('password/reset', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:password-reset-verify');

        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');
        Route::post('profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
        Route::post('password', [AuthController::class, 'changePassword'])->middleware(['auth:sanctum', 'throttle:5,10']);
    });

    Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/', [WishlistController::class, 'store']);
        Route::post('sync', [WishlistController::class, 'sync']);
        Route::delete('{lodgifyPropertyId}', [WishlistController::class, 'destroy']);
    });
});

Route::middleware('auth:sanctum')->get('/user', fn (Request $request) => $request->user());
