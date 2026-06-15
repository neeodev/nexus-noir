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
            'seriesContext' => $this->when(
                $this->relationLoaded('series') && $this->series->isNotEmpty(),
                function () {
                    $serie = $this->series->first();
                    $position = $serie->pivot->position;
                    $siblings = $serie->stories()
                        ->published()
                        ->orderByPivot('position')
                        ->get(['stories.id', 'stories.slug', 'stories.title']);
                    $idx = $siblings->search(fn ($s) => $s->id === $this->id);
                    return [
                        'id'       => $serie->id,
                        'title'    => $serie->title,
                        'slug'     => $serie->slug,
                        'position' => $position,
                        'total'    => $siblings->count(),
                        'prev'     => $idx > 0
                            ? ['title' => $siblings[$idx - 1]->title, 'slug' => $siblings[$idx - 1]->slug]
                            : null,
                        'next'     => $idx !== false && $idx < $siblings->count() - 1
                            ? ['title' => $siblings[$idx + 1]->title, 'slug' => $siblings[$idx + 1]->slug]
                            : null,
                    ];
                }
            ),
            'publishedAt' => $this->published_at?->toIso8601String(),
        ];
    }
}
