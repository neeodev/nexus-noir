<?php

use App\Http\Controllers\Api\V1\StoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth (utilisateur courant)
    Route::get('/auth/user', fn (Request $request) => $request->user())
        ->middleware('auth:sanctum');

    // Stories (Archives) — lecture publique
    Route::get('/stories', [StoryController::class, 'index']);
    Route::get('/stories/{slug}', [StoryController::class, 'show']);
});
