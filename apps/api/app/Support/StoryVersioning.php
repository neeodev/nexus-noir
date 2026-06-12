<?php

namespace App\Support;

use App\Models\Story;
use App\Models\StoryVersion;

/**
 * Capture l'historique des nouvelles.
 *
 * Pour ne pas créer une version à chaque autosave, les snapshots non forcés
 * sont throttlés (un par fenêtre de THROTTLE_SECONDS). On garde au plus
 * MAX_VERSIONS snapshots par nouvelle.
 */
class StoryVersioning
{
    private const THROTTLE_SECONDS = 90;
    private const MAX_VERSIONS = 50;

    public static function snapshot(Story $story, ?int $userId, bool $force = false): ?StoryVersion
    {
        if (! $force) {
            $last = $story->versions()->latest('created_at')->first();
            if ($last && $last->created_at->gt(now()->subSeconds(self::THROTTLE_SECONDS))) {
                return null;
            }
        }

        $version = $story->versions()->create([
            'created_by' => $userId,
            'version' => $story->version,
            'title' => $story->title,
            'content' => $story->content,
            'word_count' => $story->word_count,
        ]);

        self::prune($story);

        return $version;
    }

    private static function prune(Story $story): void
    {
        $ids = $story->versions()
            ->latest('created_at')
            ->skip(self::MAX_VERSIONS)
            ->take(1000)
            ->pluck('id');

        if ($ids->isNotEmpty()) {
            StoryVersion::whereIn('id', $ids)->delete();
        }
    }
}
