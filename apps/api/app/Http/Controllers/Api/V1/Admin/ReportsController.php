<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CommentReport::query()
            ->with(['user:id,name', 'comment:id,body,story_id', 'comment.story:id,title,slug', 'resolver:id,name'])
            ->orderByDesc('created_at');

        match ($request->string('status')->toString()) {
            'pending'   => $query->where('status', 'pending'),
            'reviewed'  => $query->where('status', 'reviewed'),
            'dismissed' => $query->where('status', 'dismissed'),
            default     => null,
        };

        $paginated = $query->paginate(30)->withQueryString();

        return response()->json($paginated->through(fn ($r) => [
            'id'         => $r->id,
            'reason'     => $r->reason,
            'body'       => $r->body,
            'status'     => $r->status,
            'createdAt'  => $r->created_at->toIso8601String(),
            'resolvedAt' => $r->resolved_at?->toIso8601String(),
            'reporter'   => ['id' => $r->user->id, 'name' => $r->user->name],
            'resolver'   => $r->resolver ? ['id' => $r->resolver->id, 'name' => $r->resolver->name] : null,
            'comment'    => [
                'id'    => $r->comment->id,
                'body'  => $r->comment->body,
                'story' => $r->comment->story
                    ? ['title' => $r->comment->story->title, 'slug' => $r->comment->story->slug]
                    : null,
            ],
        ]));
    }

    public function update(Request $request, CommentReport $report): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['reviewed', 'dismissed'])],
        ]);

        $report->update([
            'status'      => $validated['status'],
            'resolved_at' => now(),
            'resolved_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Signalement mis à jour.']);
    }
}
