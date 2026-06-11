<?php

namespace App\Http\Resources\V1;

use App\Enums\Permission;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Comment
 */
class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $canModerate = $user?->hasPermission(Permission::CommentsModerate) ?? false;
        $isOwner = $user && $user->id === $this->user_id;

        // Le corps masqué/supprimé n'est révélé qu'aux modérateurs.
        $deleted = $this->trashed();
        $body = match (true) {
            $deleted && ! $canModerate => '[commentaire supprimé]',
            $this->is_hidden && ! $canModerate => '[commentaire masqué par la modération]',
            default => $this->body,
        };

        return [
            'id' => $this->id,
            'parentId' => $this->parent_id,
            'body' => $body,
            'author' => $deleted && ! $canModerate
                ? null
                : ['name' => $this->user?->name],
            'isPinned' => $this->is_pinned,
            'isHidden' => $this->is_hidden,
            'isDeleted' => $deleted,
            'createdAt' => $this->created_at?->toIso8601String(),
            'can' => [
                'delete' => ! $deleted && ($isOwner || $canModerate),
                'moderate' => ! $deleted && $canModerate,
                'reply' => ! $deleted,
            ],
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
