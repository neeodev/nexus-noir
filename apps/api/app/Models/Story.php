<?php

namespace App\Models;

use App\Enums\StoryStatus;
use App\Enums\StoryVisibility;
use Database\Factories\StoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Story extends Model
{
    /** @use HasFactory<StoryFactory> */
    use HasFactory;

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'summary_short',
        'summary_long',
        'cover_image',
        'status',
        'visibility',
        'content',
        'reading_time',
        'word_count',
        'version',
        'tags',
        'content_warnings',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => StoryStatus::class,
            'visibility' => StoryVisibility::class,
            'content' => 'array',
            'tags' => 'array',
            'content_warnings' => 'array',
            'published_at' => 'datetime',
        ];
    }

    /** Le slug sert de cle de route publique. */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(StoryReaction::class);
    }

    /** Nouvelles publiees et accessibles publiquement. */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', StoryStatus::Published)
            ->whereIn('visibility', [StoryVisibility::Public, StoryVisibility::Authenticated])
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }
}
