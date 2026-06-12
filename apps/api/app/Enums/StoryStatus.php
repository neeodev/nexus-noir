<?php

namespace App\Enums;

enum StoryStatus: string
{
    case Draft = 'draft';
    case InReview = 'in_review';
    case ReadyToPublish = 'ready_to_publish';
    case Published = 'published';
    case Archived = 'archived';
    case Private = 'private';

    /** Statuts visibles publiquement. */
    public function isPublic(): bool
    {
        return $this === self::Published;
    }

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::InReview => 'En correction',
            self::ReadyToPublish => 'Prêt à publier',
            self::Published => 'Publié',
            self::Archived => 'Archivé',
            self::Private => 'Privé',
        };
    }
}
