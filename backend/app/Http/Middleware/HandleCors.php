<?php

namespace App\Http\Middleware;

use Closure;

class HandleCors extends \Illuminate\Http\Middleware\HandleCors
{
    public function handle($request, Closure $next)
    {
        $publicCms = $request->is('api/v1/cms/*');
        if ($publicCms && $request->isMethod('GET')) {
            $response = $next($request);
            $response->headers->set('Access-Control-Allow-Origin', '*');
            return $response;
        }
        if ($publicCms && $request->isMethod('OPTIONS') && strtoupper((string) $request->header('Access-Control-Request-Method')) === 'GET') {
            return response('', 204, ['Access-Control-Allow-Origin' => '*', 'Access-Control-Allow-Methods' => 'GET', 'Access-Control-Allow-Headers' => 'Accept, Content-Type']);
        }
        $response = parent::handle($request, $next);
        $origin = $request->header('Origin');
        if ($origin && !in_array($origin, config('cors.allowed_origins', []), true)) {
            $response->headers->remove('Access-Control-Allow-Origin');
        }
        return $response;
    }
}
