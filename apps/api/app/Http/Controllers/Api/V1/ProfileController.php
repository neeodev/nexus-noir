<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\V1\StoryListResource;
use App\Http\Resources\V1\UserResource;
use App\Models\StoryView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->only('name', 'email'));
        return new UserResource($user);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['password' => Hash::make((string) $request->string('password'))]);
        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }

    public function readings(Request $request): AnonymousResourceCollection
    {
        $storyIds = StoryView::query()
            ->where('user_id', $request->user()->id)
            ->select('story_id')
            ->selectRaw('MAX(viewed_at) as last_viewed_at')
            ->groupBy('story_id')
            ->orderByDesc('last_viewed_at')
            ->limit(20)
            ->pluck('story_id');

        $stories = \App\Models\Story::query()
            ->published()
            ->whereIn('id', $storyIds)
            ->withCount('views')
            ->get()
            ->sortBy(fn ($s) => array_search($s->id, $storyIds->toArray()))
            ->values();

        return StoryListResource::collection($stories);
    }
}
