<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StoryStatus;
use App\Enums\StoryVisibility;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStoryRequest;
use App\Http\Requests\Admin\UpdateStoryRequest;
use App\Http\Resources\V1\AdminStoryResource;
use App\Models\Story;
use App\Support\StoryContentMetrics;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class AdminStoryController extends Controller
{
    /** Liste toutes les nouvelles (brouillons compris), filtrable par statut. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $stories = Story::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest('updated_at')
            ->paginate(20);

        return AdminStoryResource::collection($stories);
    }

    public function show(Story $story): AdminStoryResource
    {
        return new AdminStoryResource($story->load('author'));
    }

    /** Crée une nouvelle (brouillon par défaut). */
    public function store(StoreStoryRequest $request): AdminStoryResource
    {
        $data = $request->validated();
        // validated() élague les sous-clés sans règle : on lit le document brut.
        $content = $request->input('content');

        $story = Story::create([
            'author_id' => $request->user()->id,
            'title' => $data['title'],
            'slug' => $this->resolveSlug($data['slug'] ?? null, $data['title']),
            'summary_short' => $data['summaryShort'] ?? null,
            'summary_long' => $data['summaryLong'] ?? null,
            'cover_image' => $data['coverImage'] ?? null,
            'status' => $data['status'] ?? StoryStatus::Draft->value,
            'visibility' => $data['visibility'] ?? StoryVisibility::Public->value,
            'content' => $content,
            'tags' => $data['tags'] ?? [],
            'content_warnings' => $data['contentWarnings'] ?? [],
            'word_count' => StoryContentMetrics::wordCount($content),
            'reading_time' => StoryContentMetrics::readingTime($content),
        ]);

        return new AdminStoryResource($story);
    }

    public function update(UpdateStoryRequest $request, Story $story): AdminStoryResource
    {
        $data = $request->validated();

        $map = [
            'title' => 'title',
            'slug' => 'slug',
            'summaryShort' => 'summary_short',
            'summaryLong' => 'summary_long',
            'coverImage' => 'cover_image',
            'status' => 'status',
            'visibility' => 'visibility',
            'tags' => 'tags',
            'contentWarnings' => 'content_warnings',
        ];

        foreach ($map as $input => $column) {
            if (array_key_exists($input, $data)) {
                $story->{$column} = $data[$input];
            }
        }

        if (array_key_exists('content', $data)) {
            // validated() élague les sous-clés sans règle : on lit le document brut.
            $content = $request->input('content');
            $story->content = $content;
            $story->word_count = StoryContentMetrics::wordCount($content);
            $story->reading_time = StoryContentMetrics::readingTime($content);
            $story->version = $story->version + 1;
        }

        $story->save();

        return new AdminStoryResource($story->load('author'));
    }

    /** Met la nouvelle en ligne. */
    public function publish(Story $story): AdminStoryResource
    {
        $story->update([
            'status' => StoryStatus::Published,
            'visibility' => $story->visibility === StoryVisibility::Hidden
                ? StoryVisibility::Public
                : $story->visibility,
            'published_at' => $story->published_at ?? now(),
        ]);

        return new AdminStoryResource($story);
    }

    /** Repasse la nouvelle en brouillon (la retire du public). */
    public function unpublish(Story $story): AdminStoryResource
    {
        $story->update(['status' => StoryStatus::Draft]);

        return new AdminStoryResource($story);
    }

    public function destroy(Story $story): \Illuminate\Http\JsonResponse
    {
        $story->delete();

        return response()->json(['message' => 'Nouvelle supprimée.']);
    }

    /** Génère un slug unique à partir du titre si aucun n'est fourni. */
    private function resolveSlug(?string $slug, string $title): string
    {
        $base = Str::slug($slug ?: $title) ?: 'nouvelle';
        $candidate = $base;
        $i = 2;

        while (Story::where('slug', $candidate)->exists()) {
            $candidate = "{$base}-{$i}";
            $i++;
        }

        return $candidate;
    }
}
