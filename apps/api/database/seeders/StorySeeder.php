<?php

namespace Database\Seeders;

use App\Enums\StoryStatus;
use App\Enums\StoryVisibility;
use App\Models\Story;
use Illuminate\Database\Seeder;

class StorySeeder extends Seeder
{
    public function run(): void
    {
        $stories = [
            [
                'title' => 'Le Dernier Verre',
                'slug' => 'le-dernier-verre',
                'summary_short' => 'Un bar fermé depuis dix ans rouvre une nuit. Personne n\'aurait dû y entrer.',
                'reading_time' => 6,
                'word_count' => 1240,
                'tags' => ['enquête', 'nuit'],
                'content_warnings' => ['violence'],
                'content' => $this->doc([
                    $this->heading('Le Dernier Verre'),
                    $this->paragraph('La pluie tombait sur Nexus Noir comme si le ciel essayait de laver un crime trop ancien.'),
                    $this->paragraph('L\'enseigne du bar grésillait encore, dix ans après la dernière commande.'),
                    $this->quote('Ici, on ne paie jamais la dernière tournée. On la rembourse.'),
                    ['type' => 'horizontalRule'],
                    $this->paragraph('La serveuse leva les yeux. « On est fermés. On a toujours été fermés. »'),
                ]),
            ],
            [
                'title' => 'Transmission 04:00',
                'slug' => 'transmission-04-00',
                'summary_short' => 'Chaque nuit à 4h, une fréquence morte se met à parler. Cette fois, elle connaît ton nom.',
                'reading_time' => 4,
                'word_count' => 820,
                'tags' => ['transmission', 'paranormal'],
                'content_warnings' => [],
                'content' => $this->doc([
                    $this->heading('Transmission 04:00'),
                    $this->paragraph('La radio n\'avait pas d\'antenne. Elle captait quand même.'),
                    $this->quote('Tu es réveillé. Bien. Reste assis. Ne réponds pas à la porte.'),
                    ['type' => 'horizontalRule'],
                    $this->paragraph('Dehors, le couloir comptait une porte de plus que la veille.'),
                ]),
            ],
        ];

        foreach ($stories as $data) {
            Story::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'status' => StoryStatus::Published,
                    'visibility' => StoryVisibility::Public,
                    'version' => 1,
                    'published_at' => now()->subDays(count($stories)),
                ]),
            );
        }
    }

    /** @param array<int, array<string, mixed>> $content */
    private function doc(array $content): array
    {
        return ['type' => 'doc', 'content' => $content];
    }

    private function heading(string $text): array
    {
        return [
            'type' => 'heading',
            'attrs' => ['level' => 2],
            'content' => [['type' => 'text', 'text' => $text]],
        ];
    }

    private function paragraph(string $text): array
    {
        return [
            'type' => 'paragraph',
            'content' => [['type' => 'text', 'text' => $text]],
        ];
    }

    private function quote(string $text): array
    {
        return [
            'type' => 'blockquote',
            'content' => [$this->paragraph($text)],
        ];
    }
}
