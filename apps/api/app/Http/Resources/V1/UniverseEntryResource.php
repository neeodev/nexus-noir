<?php

namespace App\Http\Resources\V1;

use App\Models\UniverseEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin UniverseEntry
 */
class UniverseEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id'              => $this->id,
            'type'            => $this->type->value,
            'typeLabel'       => $this->type->label(),
            'name'            => $this->name,
            'slug'            => $this->slug,
            'summary'         => $this->summary,
            'content'         => $this->whenLoaded('_detail', fn () => $this->content),
            'meta'            => $this->meta,
            'coverImage'      => $this->cover_image,
            'isHidden'        => $this->is_hidden,
            'unlockCondition' => $this->when(
                $request->user()?->hasPermission(\App\Enums\Permission::AdminAccess),
                $this->unlock_condition
            ),
            'sortOrder'       => $this->sort_order,
            'isLocked'        => $this->is_hidden && ! $this->isUnlockedFor($user),
            'stories'         => $this->whenLoaded('stories', fn () =>
                $this->stories->map(fn ($s) => [
                    'slug'  => $s->slug,
                    'title' => $s->title,
                ])
            ),
            'related'         => $this->whenLoaded('related', fn () =>
                $this->related->map(fn ($r) => [
                    'slug'         => $r->slug,
                    'name'         => $r->name,
                    'type'         => $r->type->value,
                    'typeLabel'    => $r->type->label(),
                    'coverImage'   => $r->cover_image,
                    'relationType' => $r->pivot->relation_type,
                ])
            ),
        ];
    }

    private function isUnlockedFor(?\App\Models\User $user): bool
    {
        if (! $this->is_hidden) return true;
        if (! $user) return false;

        $condition = $this->unlock_condition;
        if (empty($condition['type'])) return false;

        return match ($condition['type']) {
            'badge'      => $user->badges()->where('slug', $condition['value'] ?? '')->exists(),
            'story_read' => $user->views()
                ->whereHas('story', fn ($q) => $q->where('slug', $condition['value'] ?? ''))
                ->exists(),
            default      => false,
        };
    }
}
