<?php

namespace App\Http\Resources\V1;

use App\Models\Series;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Series
 */
class SeriesResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'summary'      => $this->summary,
            'coverImage'   => $this->cover_image,
            'isCompleted'  => $this->is_completed,
            'sortOrder'    => $this->sort_order,
            'storiesCount' => $this->stories_count ?? ($this->relationLoaded('stories') ? $this->stories->count() : null),
            'stories'      => $this->whenLoaded('stories', fn () =>
                $this->stories->map(fn ($s) => [
                    'id'          => $s->id,
                    'title'       => $s->title,
                    'slug'        => $s->slug,
                    'coverImage'  => $s->cover_image,
                    'position'    => $s->pivot->position,
                    'publishedAt' => $s->published_at?->toIso8601String(),
                    'readingTime' => $s->reading_time,
                    'summaryShort' => $s->summary_short,
                ])
            ),
        ];
    }
}
