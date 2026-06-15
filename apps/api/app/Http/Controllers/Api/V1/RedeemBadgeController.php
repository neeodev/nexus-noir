<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BadgeResource;
use App\Support\BadgeAwarder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedeemBadgeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100'],
        ]);

        $awarded = BadgeAwarder::onSecretCode($request->user(), $validated['code']);

        return response()->json([
            'awarded' => BadgeResource::collection(collect($awarded)),
            'count'   => count($awarded),
        ]);
    }
}
