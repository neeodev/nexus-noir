<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Comments\StoreCommentRequest;
use App\Http\Resources\V1\CommentResource;
use App\Models\Comment;
use App\Models\Story;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class CommentController extends Controller
{
    /** Fil de commentaires d'une nouvelle, en arbre. */
    public function index(string $slug): AnonymousResourceCollection
    {
        $story = $this->findPublishedStory($slug);

        // On charge tout (y compris les supprimés) pour préserver la structure
        // du thread, puis on élague les supprimés sans réponse survivante.
        $all = $story->comments()
            ->withTrashed()
            ->with('user')
            ->orderBy('created_at')
            ->get();

        return CommentResource::collection($this->buildTree($all));
    }

    /** Poste un commentaire ou une réponse. */
    public function store(StoreCommentRequest $request, string $slug): JsonResponse
    {
        $story = $this->findPublishedStory($slug);
        $parentId = $request->integer('parentId') ?: null;

        if ($parentId !== null) {
            // La réponse doit cibler un commentaire de la même nouvelle.
            $parentBelongs = $story->comments()->whereKey($parentId)->exists();
            abort_unless($parentBelongs, Response::HTTP_UNPROCESSABLE_ENTITY, 'Commentaire parent invalide.');
        }

        $comment = $story->comments()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $parentId,
            'body' => (string) $request->string('body'),
        ]);

        $newBadges = \App\Support\BadgeAwarder::onComment($request->user());

        return response()->json([
            'data'      => new CommentResource($comment->load('user')),
            'newBadges' => \App\Http\Resources\V1\BadgeResource::collection(collect($newBadges)),
        ], Response::HTTP_CREATED);
    }

    /** Supprime (soft delete) : auteur ou modérateur. */
    public function destroy(Comment $comment): JsonResponse
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return response()->json(['message' => 'Commentaire supprimé.']);
    }

    /** Modération : masquer / afficher / épingler. */
    public function moderate(Request $request, Comment $comment): CommentResource
    {
        Gate::authorize('moderate', $comment);

        $validated = $request->validate([
            'isHidden' => ['sometimes', 'boolean'],
            'isPinned' => ['sometimes', 'boolean'],
        ]);

        $comment->fill([
            'is_hidden' => $validated['isHidden'] ?? $comment->is_hidden,
            'is_pinned' => $validated['isPinned'] ?? $comment->is_pinned,
        ])->save();

        return new CommentResource($comment->load('user'));
    }

    private function findPublishedStory(string $slug): Story
    {
        return Story::query()->published()->where('slug', $slug)->firstOrFail();
    }

    /**
     * Construit l'arbre des commentaires et élague les supprimés sans
     * descendance survivante. Racines triées : épinglés puis plus récents.
     *
     * @param  Collection<int, Comment>  $all
     * @return list<Comment>
     */
    private function buildTree(Collection $all): array
    {
        $childrenByParent = [];
        foreach ($all as $comment) {
            $childrenByParent[$comment->parent_id][] = $comment;
        }

        $attach = function (Comment $comment) use (&$attach, &$childrenByParent): ?Comment {
            $children = [];
            foreach ($childrenByParent[$comment->id] ?? [] as $child) {
                if ($kept = $attach($child)) {
                    $children[] = $kept;
                }
            }

            // Un commentaire supprimé sans réponse survivante disparaît du fil.
            if ($comment->trashed() && $children === []) {
                return null;
            }

            $comment->setRelation('replies', new Collection($children));

            return $comment;
        };

        $roots = [];
        foreach ($childrenByParent[null] ?? [] as $root) {
            if ($kept = $attach($root)) {
                $roots[] = $kept;
            }
        }

        usort($roots, fn (Comment $a, Comment $b) => [$b->is_pinned ? 1 : 0, $b->created_at->timestamp]
            <=> [$a->is_pinned ? 1 : 0, $a->created_at->timestamp]);

        return $roots;
    }
}
