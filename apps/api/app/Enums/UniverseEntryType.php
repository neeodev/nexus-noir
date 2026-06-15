<?php

namespace App\Enums;

enum UniverseEntryType: string
{
    case Character = 'character';
    case Place     = 'place';
    case Faction   = 'faction';
    case Event     = 'event';
    case Concept   = 'concept';

    public function label(): string
    {
        return match ($this) {
            self::Character => 'Personnage',
            self::Place     => 'Lieu',
            self::Faction   => 'Faction',
            self::Event     => 'Événement',
            self::Concept   => 'Concept',
        };
    }

    public function labelPlural(): string
    {
        return match ($this) {
            self::Character => 'Personnages',
            self::Place     => 'Lieux',
            self::Faction   => 'Factions',
            self::Event     => 'Événements',
            self::Concept   => 'Concepts',
        };
    }
}
