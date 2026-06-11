<?php

namespace App\Enums;

/**
 * Réactions immersives de Nexus Noir.
 *
 * L'idée du README : donner une identité à l'engagement, plus parlante
 * qu'un simple cœur ou pouce bleu.
 */
enum ReactionType: string
{
    case Claque = 'claque';
    case Malaise = 'malaise';
    case Frisson = 'frisson';
    case Colere = 'colere';
    case ChefDoeuvre = 'chef_doeuvre';
    case TropReel = 'trop_reel';
    case PeurSuite = 'peur_suite';

    public function label(): string
    {
        return match ($this) {
            self::Claque => "J'ai pris une claque",
            self::Malaise => "Ça m'a mis mal",
            self::Frisson => 'Frisson',
            self::Colere => 'Colère',
            self::ChefDoeuvre => "Chef d'œuvre",
            self::TropReel => 'Trop réel',
            self::PeurSuite => "J'ai peur pour la suite",
        };
    }

    public function emoji(): string
    {
        return match ($this) {
            self::Claque => '👊',
            self::Malaise => '😰',
            self::Frisson => '🥶',
            self::Colere => '😡',
            self::ChefDoeuvre => '🖤',
            self::TropReel => '🩸',
            self::PeurSuite => '👁️',
        };
    }
}
