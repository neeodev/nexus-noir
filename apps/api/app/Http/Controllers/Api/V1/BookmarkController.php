<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\StoryListResource;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookmarkController extends Controller
{
    /** Liste les nouvelles mises en favori par l'utilisateur connecté. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $stories = $request->user()
            ->bookmarkedStories()
            ->published()
            ->withCount('views')
            ->latest('bookmarks.created_at')
            ->paginate(20);

        return StoryListResource::collection($stories);
    }

    /** Ajoute ou retire un marque-page (toggle). */
    public function toggle(Request $request, string $slug): JsonResponse
    {
        $story = Story::published()->where('slug', $slug)->firstOrFail();
        $user  = $request->user();

        $exists = $user->bookmarkedStories()->where('story_id', $story->id)->exists();

        if ($exists) {
            $user->bookmarkedStories()->detach($story->id);
            return response()->json(['bookmarked' => false]);
        }

        $user->bookmarkedStories()->attach($story->id);
        return response()->json(['bookmarked' => true]);
    }

    /** Retourne les slugs des nouvelles mises en favori (pour l'état UI). */
    public function slugs(Request $request): JsonResponse
    {
        $slugs = $request->user()
            ->bookmarkedStories()
            ->pluck('slug')
            ->all();

        return response()->json(['slugs' => $slugs]);
    }
}
