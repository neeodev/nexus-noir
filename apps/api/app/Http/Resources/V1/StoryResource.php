<?php

namespace App\Http\Resources\V1;

use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Story
 */
class StoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'summaryShort' => $this->summary_short,
            'summaryLong' => $this->summary_long,
            'coverImage' => $this->cover_image,
            'readingTime' => $this->reading_time,
            'wordCount' => $this->word_count,
            'version' => $this->version,
            'tags' => $this->tags ?? [],
            'contentWarnings' => $this->content_warnings ?? [],
            'viewsCount' => $this->views_count ?? 0,
            // Document JSON Tiptap : le front génère le HTML depuis ce JSON contrôlé.
            'content' => $this->content ?? ['type' => 'doc', 'content' => []],
            'author' => $this->whenLoaded('author', fn () => [
                'name' => $this->author?->name,
            ]),
            'publishedAt' => $this->published_at?->toIso8601String(),
        ];
    }
}
