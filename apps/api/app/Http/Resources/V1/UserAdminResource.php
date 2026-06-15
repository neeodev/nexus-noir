<?php

namespace App\Http\Resources\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserAdminResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role->value,
            'roleLabel'  => $this->role->label(),
            'isBanned'   => $this->isBanned(),
            'bannedAt'   => $this->banned_at?->toIso8601String(),
            'banReason'  => $this->ban_reason,
            'createdAt'  => $this->created_at?->toIso8601String(),
            'badgesCount'   => $this->whenLoaded('badges', fn () => $this->badges->count()),
            'readingsCount' => $this->whenLoaded('views', fn () => $this->views()->distinct('story_id')->count('story_id')),
            'badges'     => $this->whenLoaded('badges', fn () =>
                BadgeResource::collection($this->badges)
            ),
        ];
    }
}
