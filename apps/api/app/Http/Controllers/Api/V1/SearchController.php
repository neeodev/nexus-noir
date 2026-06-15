<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\StoryListResource;
use App\Http\Resources\V1\UniverseEntryResource;
use App\Models\Story;
use App\Models\UniverseEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim($request->string('q')->toString());

        if (strlen($q) < 2) {
            return response()->json(['stories' => [], 'universe' => [], 'query' => $q]);
        }

        $stories = Story::query()
            ->published()
            ->where(function ($query) use ($q) {
                $query->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($q) . '%'])
                      ->orWhereRaw('LOWER(summary_short) LIKE ?', ['%' . strtolower($q) . '%'])
                      ->orWhereRaw('LOWER(tags::text) LIKE ?', ['%' . strtolower($q) . '%']);
            })
            ->withCount('views')
            ->limit(8)
            ->get();

        $universe = UniverseEntry::query()
            ->where('is_hidden', false)
            ->where(function ($query) use ($q) {
                $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($q) . '%'])
                      ->orWhereRaw('LOWER(summary) LIKE ?', ['%' . strtolower($q) . '%']);
            })
            ->limit(6)
            ->get();

        return response()->json([
            'query'    => $q,
            'stories'  => StoryListResource::collection($stories)->resolve($request),
            'universe' => UniverseEntryResource::collection($universe)->resolve($request),
        ]);
    }
}
