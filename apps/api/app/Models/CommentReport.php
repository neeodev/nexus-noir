<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommentReport extends Model
{
    protected $fillable = [
        'comment_id',
        'user_id',
        'reason',
        'body',
        'status',
        'resolved_at',
        'resolved_by',
    ];

    protected function casts(): array
    {
        return ['resolved_at' => 'datetime'];
    }

    public function comment(): BelongsTo { return $this->belongsTo(Comment::class); }
    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function resolver(): BelongsTo { return $this->belongsTo(User::class, 'resolved_by'); }
}
