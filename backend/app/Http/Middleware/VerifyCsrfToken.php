<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestForgery as Middleware;

class VerifyCsrfToken extends Middleware
{
    // Preserve token-based admin CSRF after Laravel 13 added an origin-only shortcut.
    protected function hasValidOrigin($request)
    {
        return false;
    }
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];
}
