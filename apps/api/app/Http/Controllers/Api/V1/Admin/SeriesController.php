<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\SeriesResource;
use App\Models\Series;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SeriesController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $series = Series::query()
            ->withCount('stories')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return SeriesResource::collection($series);
    }

    public function show(Series $series): SeriesResource
    {
        $series->load('stories');

        return new SeriesResource($series);
    }

    public function store(Request $request): SeriesResource
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'slug'         => ['required', 'string', 'max:255', 'unique:series,slug'],
            'summary'      => ['nullable', 'string'],
            'cover_image'  => ['nullable', 'string', 'max:500'],
            'is_completed' => ['boolean'],
            'sort_order'   => ['integer'],
        ]);

        $series = Series::create($validated);

        return new SeriesResource($series->load('stories'));
    }

    public function update(Request $request, Series $series): SeriesResource
    {
        $validated = $request->validate([
            'title'             => ['sometimes', 'string', 'max:255'],
            'slug'              => ['sometimes', 'string', 'max:255', 'unique:series,slug,' . $series->id],
            'summary'           => ['nullable', 'string'],
            'cover_image'       => ['nullable', 'string', 'max:500'],
            'is_completed'      => ['boolean'],
            'sort_order'        => ['integer'],
            'story_ids_ordered' => ['nullable', 'array'],
            'story_ids_ordered.*' => ['integer', 'exists:stories,id'],
        ]);

        $series->update(collect($validated)->except('story_ids_ordered')->toArray());

        if ($request->has('story_ids_ordered')) {
            $syncData = [];
            foreach ($request->story_ids_ordered as $idx => $storyId) {
                $syncData[$storyId] = ['position' => $idx + 1];
            }
            $series->stories()->sync($syncData);
        }

        return new SeriesResource($series->load('stories'));
    }

    public function destroy(Series $series): JsonResponse
    {
        $series->delete();

        return response()->json(null, 204);
    }
}
