<?php

use App\Http\Controllers\Api\V1\Admin\AdminStoryController;
use App\Http\Controllers\Api\V1\Admin\BadgeController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\StatsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ReactionController;
use App\Http\Controllers\Api\V1\RedeemBadgeController;
use App\Http\Controllers\Api\V1\StoryController;
use App\Http\Controllers\Api\V1\StoryViewController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth (Citoyens) — session SPA via Sanctum
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::patch('/auth/profile', [ProfileController::class, 'update']);
        Route::patch('/auth/password', [ProfileController::class, 'updatePassword']);
        Route::get('/auth/readings', [ProfileController::class, 'readings']);
        Route::get('/auth/badges', function (\Illuminate\Http\Request $req) {
            $user = $req->user()->load('badges');
            return \App\Http\Resources\V1\BadgeResource::collection($user->badges);
        });
        Route::post('/auth/badges/redeem', RedeemBadgeController::class);
    });

    // Stories (Archives) — lecture publique
    Route::get('/stories', [StoryController::class, 'index']);
    Route::get('/stories/{slug}', [StoryController::class, 'show']);

    // Vues (Statistiques) — enregistrement public, déduplication par hash IP+date
    Route::post('/stories/{slug}/view', [StoryViewController::class, 'store']);

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

        // Historique des versions
        Route::get('/stories/{story:id}/versions', [AdminStoryController::class, 'versions'])->middleware('can:stories.view');
        Route::get('/stories/{story:id}/versions/{version}', [AdminStoryController::class, 'showVersion'])->middleware('can:stories.view');
        Route::post('/stories/{story:id}/versions/{version}/restore', [AdminStoryController::class, 'restore'])->middleware('can:stories.update');

        // Statistiques globales.
        Route::get('/stats', [StatsController::class, 'index']);

        // Marques — gestion des badges.
        Route::get('/badges', [BadgeController::class, 'index']);
        Route::post('/badges', [BadgeController::class, 'store']);
        Route::patch('/badges/{badge}', [BadgeController::class, 'update']);
        Route::delete('/badges/{badge}', [BadgeController::class, 'destroy']);

        // Preuves — upload d'images.
        Route::post('/media', [MediaController::class, 'store'])->middleware('can:stories.create');
    });
});
