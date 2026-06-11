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
            // Document structure en blocs : le front rend ce JSON, jamais du HTML brut.
            'content' => $this->content ?? ['version' => 1, 'blocks' => []],
            'author' => $this->whenLoaded('author', fn () => [
                'name' => $this->author?->name,
            ]),
            'publishedAt' => $this->published_at?->toIso8601String(),
        ];
    }
}
