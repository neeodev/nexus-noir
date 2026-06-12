<?php

namespace App\Enums;

enum StoryVisibility: string
{
    case Public = 'public';
    case Authenticated = 'authenticated';
    case Private = 'private';
    case EarlyAccess = 'early_access';
    case Hidden = 'hidden';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Public',
            self::Authenticated => 'Connectés uniquement',
            self::Private => 'Privé',
            self::EarlyAccess => 'Accès anticipé',
            self::Hidden => 'Masqué',
        };
    }
}
