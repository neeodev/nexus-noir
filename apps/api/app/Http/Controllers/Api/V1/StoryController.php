<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\StoryListResource;
use App\Http\Resources\V1\StoryResource;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StoryController extends Controller
{
    /** Liste paginee des nouvelles publiees. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $stories = Story::query()
            ->published()
            ->withCount('views')
            ->latest('published_at')
            ->paginate(perPage: 12);

        return StoryListResource::collection($stories);
    }

    /** Detail d'une nouvelle publiee, par slug. */
    public function show(string $slug): StoryResource
    {
        $story = Story::query()
            ->published()
            ->with(['author', 'universeEntries', 'series'])
            ->withCount('views')
            ->where('slug', $slug)
            ->firstOrFail();

        return new StoryResource($story);
    }
}
