<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\CommentResource;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ModerationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Comment::query()
            ->withTrashed()
            ->with(['user', 'story:id,title,slug'])
            ->orderByDesc('created_at');

        if ($storyId = $request->integer('story_id') ?: null) {
            $query->where('story_id', $storyId);
        }

        $status = $request->string('status')->toString();

        match ($status) {
            'hidden'  => $query->where('is_hidden', true)->whereNull('deleted_at'),
            'pinned'  => $query->where('is_pinned', true)->whereNull('deleted_at'),
            'deleted' => $query->whereNotNull('deleted_at'),
            default   => null,
        };

        return CommentResource::collection(
            $query->paginate(30)->withQueryString()
        );
    }
}
