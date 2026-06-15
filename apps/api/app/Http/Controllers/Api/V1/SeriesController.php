<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\SeriesResource;
use App\Models\Series;
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
        $series->load(['stories' => fn ($q) => $q->published()]);

        return new SeriesResource($series);
    }
}
