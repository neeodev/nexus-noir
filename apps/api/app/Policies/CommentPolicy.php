<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    /** Supprimer : l'auteur du commentaire, ou un modérateur. */
    public function delete(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id
            || $user->hasPermission(Permission::CommentsModerate);
    }

    /** Modérer (masquer / épingler) : permission dédiée. */
    public function moderate(User $user): bool
    {
        return $user->hasPermission(Permission::CommentsModerate);
    }
}
