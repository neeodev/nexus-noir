<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BadgeResource;
use App\Models\Story;
use App\Models\StoryView;
use App\Support\BadgeAwarder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class StoryViewController extends Controller
{
    /**
     * Enregistre une vue sur une nouvelle publiée.
     *
     * Déduplication : même (story_id, session_hash) dans la même journée UTC.
     * Le hash est calculé depuis l'IP + la clé d'application + la date (sans reverse possible).
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $story = Story::query()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $today = Carbon::today('UTC')->toDateString();
        $ip = $request->ip() ?? '0.0.0.0';
        $hash = hash('sha256', $ip . config('app.key') . $today);

        $alreadySeen = StoryView::query()
            ->where('story_id', $story->id)
            ->where('session_hash', $hash)
            ->whereDate('viewed_at', $today)
            ->exists();

        if (! $alreadySeen) {
            StoryView::create([
                'story_id'     => $story->id,
                'user_id'      => $request->user()?->id,
                'session_hash' => $hash,
                'viewed_at'    => now(),
            ]);

            if ($request->user()) {
                $newBadges = BadgeAwarder::onView($request->user(), $story);
            }
        }

        $newBadges ??= [];

        return response()->json([
            'views'     => $story->views()->count(),
            'newBadges' => BadgeResource::collection(collect($newBadges)),
        ]);
    }
}
