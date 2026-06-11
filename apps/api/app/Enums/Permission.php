<?php

namespace App\Enums;

/**
 * Permissions granulaires de Nexus Noir.
 *
 * Définies en code (et non en base) : l'ensemble est fixe, versionné et
 * testable. Chaque permission est exposée comme une "ability" de Gate, donc
 * utilisable via `$user->can('stories.publish')` ou le middleware `can:`.
 */
enum Permission: string
{
    // Stories (Archives)
    case StoriesView = 'stories.view';          // voir brouillons / non publiés
    case StoriesCreate = 'stories.create';
    case StoriesUpdate = 'stories.update';
    case StoriesPublish = 'stories.publish';
    case StoriesDelete = 'stories.delete';

    // Commentaires (Murmures)
    case CommentsCreate = 'comments.create';
    case CommentsModerate = 'comments.moderate';

    // Utilisateurs (Citoyens)
    case UsersView = 'users.view';
    case UsersManage = 'users.manage';          // bannir, suspendre, changer rôle

    // Administration (Bureau Noir)
    case AdminAccess = 'admin.access';
    case SettingsManage = 'settings.manage';
}
