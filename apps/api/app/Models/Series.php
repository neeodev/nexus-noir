<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Series extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'cover_image',
        'is_completed',
        'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_completed' => 'boolean'];
    }

    public function stories(): BelongsToMany
    {
        return $this->belongsToMany(Story::class, 'series_story')
            ->withPivot('position')
            ->orderByPivot('position');
    }
}
