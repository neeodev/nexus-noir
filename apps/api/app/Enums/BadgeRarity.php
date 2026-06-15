<?php

namespace App\Enums;

enum BadgeRarity: string
{
    case Common    = 'commun';
    case Rare      = 'rare';
    case Epic      = 'epique';
    case Legendary = 'legendaire';
    case Forbidden = 'interdit';

    public function label(): string
    {
        return match($this) {
            self::Common    => 'Commun',
            self::Rare      => 'Rare',
            self::Epic      => 'Épique',
            self::Legendary => 'Légendaire',
            self::Forbidden => 'Interdit',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Common    => '#71717a',
            self::Rare      => '#3b82f6',
            self::Epic      => '#a855f7',
            self::Legendary => '#f59e0b',
            self::Forbidden => '#ef4444',
        };
    }
}
