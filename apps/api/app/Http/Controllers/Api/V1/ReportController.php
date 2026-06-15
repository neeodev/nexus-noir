<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function store(Request $request, Comment $comment): JsonResponse
    {
        abort_if($comment->trashed(), Response::HTTP_NOT_FOUND);

        $validated = $request->validate([
            'reason' => ['required', Rule::in(['spam', 'harassment', 'spoiler', 'off_topic', 'other'])],
            'body'   => ['nullable', 'string', 'max:500'],
        ]);

        $already = CommentReport::where('comment_id', $comment->id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($already) {
            return response()->json(['message' => 'Vous avez déjà signalé ce commentaire.'], 422);
        }

        CommentReport::create([
            'comment_id' => $comment->id,
            'user_id'    => $request->user()->id,
            'reason'     => $validated['reason'],
            'body'       => $validated['body'] ?? null,
            'status'     => 'pending',
        ]);

        return response()->json(['message' => 'Signalement enregistré.'], Response::HTTP_CREATED);
    }
}
