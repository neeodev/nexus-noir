<?php

namespace App\Models;

use App\Enums\UniverseEntryType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class UniverseEntry extends Model
{
    protected $fillable = [
        'type', 'name', 'slug', 'summary', 'content', 'meta',
        'cover_image', 'is_hidden', 'unlock_condition', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'type'             => UniverseEntryType::class,
            'content'          => 'array',
            'meta'             => 'array',
            'unlock_condition' => 'array',
            'is_hidden'        => 'boolean',
        ];
    }

    public function stories(): BelongsToMany
    {
        return $this->belongsToMany(Story::class, 'story_universe_entry');
    }

    public function related(): BelongsToMany
    {
        return $this->belongsToMany(
            UniverseEntry::class,
            'universe_entry_relations',
            'entry_id',
            'related_id'
        )->withPivot('relation_type');
    }
}
