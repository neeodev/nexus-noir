<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StoryStatus;
use App\Enums\StoryVisibility;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStoryRequest;
use App\Http\Requests\Admin\UpdateStoryRequest;
use App\Http\Resources\V1\AdminStoryResource;
use App\Models\Story;
use App\Models\StoryVersion;
use App\Support\StoryContentMetrics;
use App\Support\StoryVersioning;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AdminStoryController extends Controller
{
    /** Liste toutes les nouvelles (brouillons compris), filtrable par statut. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $stories = Story::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), fn ($q) => $q->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($request->string('search')) . '%']))
            ->latest('updated_at')
            ->paginate($request->integer('per_page', 20));

        return AdminStoryResource::collection($stories);
    }

    public function show(Story $story): AdminStoryResource
    {
        return new AdminStoryResource($story->load(['author', 'universeEntries']));
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
            'version' => 1,
            'word_count' => StoryContentMetrics::wordCount($content),
            'reading_time' => StoryContentMetrics::readingTime($content),
        ]);

        StoryVersioning::snapshot($story, $request->user()->id, force: true);

        if ($request->has('universe_entry_ids')) {
            $story->universeEntries()->sync((array) $request->validated('universe_entry_ids'));
        }

        return new AdminStoryResource($story->load('universeEntries'));
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

        $contentChanged = array_key_exists('content', $data);
        $story->save();

        // Snapshot throttlé quand le contenu change (pour l'historique).
        if ($contentChanged) {
            StoryVersioning::snapshot($story, $request->user()->id);
        }

        if ($request->has('universe_entry_ids')) {
            $story->universeEntries()->sync((array) $request->validated('universe_entry_ids'));
        }

        return new AdminStoryResource($story->load(['author', 'universeEntries']));
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

        StoryVersioning::snapshot($story, request()->user()?->id, force: true);

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

    /** Historique des versions (métadonnées, plus récentes d'abord). */
    public function versions(Story $story): JsonResponse
    {
        $versions = $story->versions()
            ->with('author')
            ->latest('created_at')
            ->get()
            ->map(fn (StoryVersion $v) => [
                'id' => $v->id,
                'version' => $v->version,
                'title' => $v->title,
                'wordCount' => $v->word_count,
                'author' => $v->author?->name,
                'createdAt' => $v->created_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $versions]);
    }

    /** Contenu complet d'une version (pour aperçu avant restauration). */
    public function showVersion(Story $story, StoryVersion $version): JsonResponse
    {
        abort_unless($version->story_id === $story->id, Response::HTTP_NOT_FOUND);

        return response()->json([
            'data' => [
                'id' => $version->id,
                'version' => $version->version,
                'title' => $version->title,
                'content' => $version->content ?? ['type' => 'doc', 'content' => []],
            ],
        ]);
    }

    /** Restaure le titre et le contenu d'une version (incrémente la version courante). */
    public function restore(Story $story, StoryVersion $version): AdminStoryResource
    {
        abort_unless($version->story_id === $story->id, Response::HTTP_NOT_FOUND);

        $story->fill([
            'title' => $version->title,
            'content' => $version->content,
            'word_count' => StoryContentMetrics::wordCount($version->content),
            'reading_time' => StoryContentMetrics::readingTime($version->content),
            'version' => $story->version + 1,
        ])->save();

        StoryVersioning::snapshot($story, request()->user()?->id, force: true);

        return new AdminStoryResource($story->load('author'));
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
