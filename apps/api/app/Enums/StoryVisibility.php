<?php

namespace App\Enums;

enum StoryVisibility: string
{
    case Public = 'public';
    case Authenticated = 'authenticated';
    case Private = 'private';
    case EarlyAccess = 'early_access';
    case Hidden = 'hidden';
}
