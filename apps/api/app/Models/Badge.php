<?php

namespace App\Models;

use App\Enums\BadgeRarity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'icon',
        'rarity',
        'condition_type',
        'condition_value',
        'condition_meta',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'rarity'         => BadgeRarity::class,
            'is_active'      => 'boolean',
            'condition_meta' => 'array',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('awarded_at');
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
