<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BadgeResource;
use App\Models\Badge;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserBadgeController extends Controller
{
    public function store(User $user, Badge $badge): AnonymousResourceCollection
    {
        if (! $user->badges()->where('badge_id', $badge->id)->exists()) {
            UserBadge::create([
                'user_id'    => $user->id,
                'badge_id'   => $badge->id,
                'awarded_at' => now(),
            ]);
        }

        return BadgeResource::collection($user->fresh()->badges);
    }

    public function destroy(User $user, Badge $badge): JsonResponse
    {
        $user->badges()->detach($badge->id);

        return response()->json(['message' => 'Marque révoquée.']);
    }
}
