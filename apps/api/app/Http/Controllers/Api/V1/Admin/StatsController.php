<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\StoryView;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today('UTC');
        $weekAgo = Carbon::today('UTC')->subDays(7);

        $viewsToday = StoryView::query()
            ->whereDate('viewed_at', $today)
            ->count();

        $viewsWeek = StoryView::query()
            ->where('viewed_at', '>=', $weekAgo)
            ->count();

        $topStories = Story::query()
            ->published()
            ->withCount('views')
            ->orderByDesc('views_count')
            ->limit(10)
            ->get(['id', 'slug', 'title'])
            ->map(fn ($s) => [
                'slug'       => $s->slug,
                'title'      => $s->title,
                'viewsCount' => $s->views_count,
            ]);

        return response()->json([
            'viewsToday' => $viewsToday,
            'viewsWeek'  => $viewsWeek,
            'topStories' => $topStories,
        ]);
    }
}
