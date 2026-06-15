<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ReactionType;
use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Support\BadgeAwarder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class ReactionController extends Controller
{
    /** Compteurs publics + (si connecté) la réaction de l'utilisateur. */
    public function index(Request $request, string $slug): JsonResponse
    {
        $story = $this->findPublishedStory($slug);

        return response()->json($this->summary($story, $request));
    }

    /**
     * Pose, change ou retire la réaction de l'utilisateur (toggle).
     * Recliquer la même réaction la retire ; une autre la remplace.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', new Enum(ReactionType::class)],
        ]);

        $story = $this->findPublishedStory($slug);
        $user = $request->user();
        $type = ReactionType::from($validated['type']);

        $existing = $story->reactions()->where('user_id', $user->id)->first();

        if ($existing && $existing->type === $type) {
            $existing->delete();
        } else {
            $story->reactions()->updateOrCreate(
                ['user_id' => $user->id],
                ['type' => $type],
            );
            BadgeAwarder::onReaction($user);
        }

        return response()->json($this->summary($story->refresh(), $request));
    }

    private function findPublishedStory(string $slug): Story
    {
        return Story::query()->published()->where('slug', $slug)->firstOrFail();
    }

    /**
     * @return array{total:int, userReaction:?string, reactions:list<array{type:string,label:string,emoji:string,count:int}>}
     */
    private function summary(Story $story, Request $request): array
    {
        $counts = $story->reactions()
            ->selectRaw('type, count(*) as aggregate')
            ->groupBy('type')
            ->pluck('aggregate', 'type');

        $reactions = array_map(fn (ReactionType $type) => [
            'type' => $type->value,
            'label' => $type->label(),
            'emoji' => $type->emoji(),
            'count' => (int) ($counts[$type->value] ?? 0),
        ], ReactionType::cases());

        $userReaction = null;
        if ($user = $request->user()) {
            $userReaction = $story->reactions()
                ->where('user_id', $user->id)
                ->first()?->type->value;
        }

        return [
            'total' => (int) $counts->sum(),
            'userReaction' => $userReaction,
            'reactions' => $reactions,
        ];
    }
}
