<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $fillable = [
        'user_id',
        'disk',
        'path',
        'mime',
        'size',
        'alt',
    ];

    /** URL publique du média. */
    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
