<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'slug'            => 'premier-contact',
                'name'            => 'Premier contact',
                'description'     => 'Bienvenue dans Nexus Noir.',
                'icon'            => 'city',
                'rarity'          => 'commun',
                'condition_type'  => 'register',
                'condition_value' => null,
                'is_active'       => true,
                'sort_order'      => 1,
            ],
            [
                'slug'            => 'lecteur-des-ruelles',
                'name'            => 'Lecteur des ruelles',
                'description'     => 'A lu 3 nouvelles.',
                'icon'            => 'footsteps',
                'rarity'          => 'commun',
                'condition_type'  => 'readings_count',
                'condition_value' => 3,
                'is_active'       => true,
                'sort_order'      => 2,
            ],
            [
                'slug'            => 'temoin-enant',
                'name'            => 'Témoin gênant',
                'description'     => 'A lu 10 nouvelles.',
                'icon'            => 'eye',
                'rarity'          => 'rare',
                'condition_type'  => 'readings_count',
                'condition_value' => 10,
                'is_active'       => true,
                'sort_order'      => 3,
            ],
            [
                'slug'            => 'archiviste',
                'name'            => 'Archiviste de Nexus Noir',
                'description'     => 'A lu 20 nouvelles.',
                'icon'            => 'folder',
                'rarity'          => 'rare',
                'condition_type'  => 'readings_count',
                'condition_value' => 20,
                'is_active'       => true,
                'sort_order'      => 4,
            ],
            [
                'slug'            => 'complice-silencieux',
                'name'            => 'Complice silencieux',
                'description'     => 'A donné 10 réactions.',
                'icon'            => 'link',
                'rarity'          => 'rare',
                'condition_type'  => 'reactions_given',
                'condition_value' => 10,
                'is_active'       => true,
                'sort_order'      => 5,
            ],
            [
                'slug'            => 'lecteur-de-nuit',
                'name'            => 'Lecteur de nuit',
                'description'     => 'A lu entre minuit et 4h du matin.',
                'icon'            => 'moon',
                'rarity'          => 'epique',
                'condition_type'  => 'reading_at_night',
                'condition_value' => null,
                'is_active'       => true,
                'sort_order'      => 6,
            ],
            [
                'slug'            => 'ancien-du-beton',
                'name'            => 'Ancien du béton',
                'description'     => 'Membre depuis 30 jours.',
                'icon'            => 'clock',
                'rarity'          => 'rare',
                'condition_type'  => 'account_age',
                'condition_value' => 30,
                'is_active'       => true,
                'sort_order'      => 7,
            ],
        ];

        foreach ($badges as $badge) {
            Badge::firstOrCreate(
                ['slug' => $badge['slug']],
                $badge
            );

            // Met à jour l'icône si le badge existait déjà avec un emoji
            Badge::where('slug', $badge['slug'])->update(['icon' => $badge['icon']]);
        }
    }
}
