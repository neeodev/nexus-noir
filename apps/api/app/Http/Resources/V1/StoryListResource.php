<?php

namespace App\Http\Resources\V1;

use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Story
 */
class StoryListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'summaryShort' => $this->summary_short,
            'coverImage' => $this->cover_image,
            'readingTime' => $this->reading_time,
            'wordCount' => $this->word_count,
            'tags' => $this->tags ?? [],
            'contentWarnings' => $this->content_warnings ?? [],
            'viewsCount' => $this->views_count ?? 0,
            'publishedAt' => $this->published_at?->toIso8601String(),
        ];
    }
}
