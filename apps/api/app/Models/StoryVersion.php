<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryVersion extends Model
{
    protected $fillable = [
        'story_id',
        'created_by',
        'version',
        'title',
        'content',
        'word_count',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
