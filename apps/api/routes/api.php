<?php

use App\Http\Controllers\Api\V1\Admin\AdminStoryController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ReactionController;
use App\Http\Controllers\Api\V1\StoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth (Citoyens) — session SPA via Sanctum
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);
    });

    // Stories (Archives) — lecture publique
    Route::get('/stories', [StoryController::class, 'index']);
    Route::get('/stories/{slug}', [StoryController::class, 'show']);

    // Réactions (Impacts) — compteurs publics, réaction réservée aux connectés
    Route::get('/stories/{slug}/reactions', [ReactionController::class, 'index']);
    Route::post('/stories/{slug}/reactions', [ReactionController::class, 'store'])
        ->middleware('auth:sanctum');

    // Commentaires (Murmures) — lecture publique, écriture/modération aux connectés
    Route::get('/stories/{slug}/comments', [CommentController::class, 'index']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/stories/{slug}/comments', [CommentController::class, 'store'])
            ->middleware('can:comments.create');
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
        Route::patch('/comments/{comment}/moderate', [CommentController::class, 'moderate']);
    });

    // Bureau Noir — accès réservé aux rôles disposant de la permission admin.access.
    Route::middleware(['auth:sanctum', 'can:admin.access'])->prefix('admin')->group(function () {
        Route::get('/ping', fn () => response()->json(['message' => 'Bienvenue au Bureau Noir.']));

        // Salle d'écriture — gestion des nouvelles (binding par id).
        Route::get('/stories', [AdminStoryController::class, 'index'])->middleware('can:stories.view');
        Route::post('/stories', [AdminStoryController::class, 'store'])->middleware('can:stories.create');
        Route::get('/stories/{story:id}', [AdminStoryController::class, 'show'])->middleware('can:stories.view');
        Route::patch('/stories/{story:id}', [AdminStoryController::class, 'update'])->middleware('can:stories.update');
        Route::delete('/stories/{story:id}', [AdminStoryController::class, 'destroy'])->middleware('can:stories.delete');
        Route::post('/stories/{story:id}/publish', [AdminStoryController::class, 'publish'])->middleware('can:stories.publish');
        Route::post('/stories/{story:id}/unpublish', [AdminStoryController::class, 'unpublish'])->middleware('can:stories.publish');

        // Preuves — upload d'images.
        Route::post('/media', [MediaController::class, 'store'])->middleware('can:stories.create');
    });
});
