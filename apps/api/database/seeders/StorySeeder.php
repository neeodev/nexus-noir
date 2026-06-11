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
                'content' => [
                    'version' => 1,
                    'blocks' => [
                        ['id' => 'b1', 'type' => 'heading', 'level' => 1, 'content' => 'Le Dernier Verre'],
                        ['id' => 'b2', 'type' => 'content_warning', 'label' => 'Violence, ambiance oppressante'],
                        ['id' => 'b3', 'type' => 'paragraph', 'content' => [
                            ['type' => 'text', 'text' => 'La pluie tombait sur Nexus Noir comme si le ciel essayait de laver un crime trop ancien.'],
                        ]],
                        ['id' => 'b4', 'type' => 'paragraph', 'content' => [
                            ['type' => 'text', 'text' => 'L\'enseigne du bar grésillait encore, dix ans après la dernière commande.'],
                        ]],
                        ['id' => 'b5', 'type' => 'dialogue', 'speaker' => 'La serveuse', 'content' => [
                            ['type' => 'text', 'text' => 'On est fermés. On a toujours été fermés.'],
                        ]],
                        ['id' => 'b6', 'type' => 'scene_break'],
                        ['id' => 'b7', 'type' => 'quote', 'content' => [
                            ['type' => 'text', 'text' => 'Ici, on ne paie jamais la dernière tournée. On la rembourse.'],
                        ]],
                        ['id' => 'b8', 'type' => 'author_note', 'content' => [
                            ['type' => 'text', 'text' => 'Première archive retrouvée dans le secteur 7.'],
                        ]],
                    ],
                ],
            ],
            [
                'title' => 'Transmission 04:00',
                'slug' => 'transmission-04-00',
                'summary_short' => 'Chaque nuit à 4h, une fréquence morte se met à parler. Cette fois, elle connaît ton nom.',
                'reading_time' => 4,
                'word_count' => 820,
                'tags' => ['transmission', 'paranormal'],
                'content_warnings' => [],
                'content' => [
                    'version' => 1,
                    'blocks' => [
                        ['id' => 'c1', 'type' => 'heading', 'level' => 1, 'content' => 'Transmission 04:00'],
                        ['id' => 'c2', 'type' => 'paragraph', 'content' => [
                            ['type' => 'text', 'text' => 'La radio n\'avait pas d\'antenne. Elle captait quand même.'],
                        ]],
                        ['id' => 'c3', 'type' => 'dialogue', 'speaker' => 'La voix', 'content' => [
                            ['type' => 'text', 'text' => 'Tu es réveillé. Bien. Reste assis. Ne réponds pas à la porte.'],
                        ]],
                        ['id' => 'c4', 'type' => 'scene_break'],
                        ['id' => 'c5', 'type' => 'paragraph', 'content' => [
                            ['type' => 'text', 'text' => 'Dehors, le couloir comptait une porte de plus que la veille.'],
                        ]],
                    ],
                ],
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
}
