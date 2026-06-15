<?php

namespace App\Http\Resources\V1;

use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Story
 */
class AdminStoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'summaryShort' => $this->summary_short,
            'summaryLong' => $this->summary_long,
            'coverImage' => $this->cover_image,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'visibility' => $this->visibility->value,
            'visibilityLabel' => $this->visibility->label(),
            'content' => $this->content ?? ['type' => 'doc', 'content' => []],
            'tags' => $this->tags ?? [],
            'contentWarnings' => $this->content_warnings ?? [],
            'readingTime' => $this->reading_time,
            'wordCount' => $this->word_count,
            'version' => $this->version,
            'author' => $this->whenLoaded('author', fn () => ['name' => $this->author?->name]),
            'universeEntries' => $this->whenLoaded('universeEntries', fn () =>
                $this->universeEntries->map(fn ($e) => [
                    'id'        => $e->id,
                    'type'      => $e->type->value,
                    'typeLabel' => $e->type->label(),
                    'name'      => $e->name,
                    'slug'      => $e->slug,
                    'coverImage' => $e->cover_image,
                ])
            ),
            'publishedAt' => $this->published_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
