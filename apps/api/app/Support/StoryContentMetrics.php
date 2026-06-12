<?php

namespace App\Support;

/**
 * Calcule le nombre de mots et le temps de lecture estimé d'un document
 * Tiptap (on parcourt récursivement les nœuds texte).
 */
class StoryContentMetrics
{
    private const WORDS_PER_MINUTE = 200;

    /** @param array<string, mixed>|null $content */
    public static function wordCount(?array $content): int
    {
        $text = trim(self::extractText($content));

        if ($text === '') {
            return 0;
        }

        return count(preg_split('/\s+/', $text) ?: []);
    }

    /** @param array<string, mixed>|null $content */
    public static function readingTime(?array $content): int
    {
        $words = self::wordCount($content);

        return max(1, (int) ceil($words / self::WORDS_PER_MINUTE));
    }

    /** @param array<string, mixed>|null $node */
    private static function extractText(?array $node): string
    {
        if ($node === null) {
            return '';
        }

        $text = '';

        if (($node['type'] ?? null) === 'text' && isset($node['text'])) {
            $text .= ' '.$node['text'];
        }

        foreach ($node['content'] ?? [] as $child) {
            if (is_array($child)) {
                $text .= ' '.self::extractText($child);
            }
        }

        return $text;
    }
}
