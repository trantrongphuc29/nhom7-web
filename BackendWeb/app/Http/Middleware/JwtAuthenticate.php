<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization', '');
        $token = Str::of($header)->replace('Bearer ', '')->trim()->value();
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Authentication required'], 401);
        }

        try {
            $payload = app(JwtService::class)->decode($token);
            $user = User::findOrFail((int) ($payload->sub ?? 0));
            $request->setUserResolver(fn () => $user);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired token'], 401);
        }

        return $next($request);
    }
}
