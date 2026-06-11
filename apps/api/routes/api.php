<?php

use App\Http\Controllers\Api\V1\AuthController;
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

    // Bureau Noir — accès réservé aux rôles disposant de la permission admin.access.
    Route::middleware(['auth:sanctum', 'can:admin.access'])->prefix('admin')->group(function () {
        Route::get('/ping', fn () => response()->json(['message' => 'Bienvenue au Bureau Noir.']));
    });
});
