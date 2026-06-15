<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isBanned()) {
            return response()->json([
                'message'   => 'Votre compte a été suspendu.',
                'banReason' => $user->ban_reason,
            ], 403);
        }

        return $next($request);
    }
}
