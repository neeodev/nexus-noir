<?php

namespace App\Http\Resources\V1;

use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Badge */
class BadgeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'slug'           => $this->slug,
            'name'           => $this->name,
            'description'    => $this->description,
            'icon'           => $this->icon,
            'rarity'         => $this->rarity->value,
            'rarityLabel'    => $this->rarity->label(),
            'rarityColor'    => $this->rarity->color(),
            'conditionType'  => $this->condition_type,
            'conditionValue' => $this->condition_value,
            'conditionMeta'  => $this->condition_meta,
            'isActive'       => $this->is_active,
            'sortOrder'      => $this->sort_order,
            'awardedAt'      => $this->whenPivotLoaded('user_badges', fn () =>
                $this->pivot->awarded_at?->toIso8601String()
            ),
        ];
    }
}
