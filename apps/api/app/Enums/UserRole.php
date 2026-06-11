<?php

namespace App\Enums;

/**
 * Rôles de Nexus Noir.
 *
 * `Visitor` correspond à un utilisateur non authentifié — il n'est jamais
 * stocké en base, mais l'enum le décrit pour cohérence. Le niveau hiérarchique
 * sert aux comparaisons "au moins ce rôle".
 */
enum UserRole: string
{
    case Visitor = 'visitor';
    case Reader = 'reader';
    case Moderator = 'moderator';
    case Editor = 'editor';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';

    public function level(): int
    {
        return match ($this) {
            self::Visitor => 0,
            self::Reader => 1,
            self::Moderator => 2,
            self::Editor => 3,
            self::Admin => 4,
            self::SuperAdmin => 5,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Visitor => 'Visiteur',
            self::Reader => 'Lecteur',
            self::Moderator => 'Modérateur',
            self::Editor => 'Éditeur',
            self::Admin => 'Administrateur',
            self::SuperAdmin => 'Super administrateur',
        };
    }

    /**
     * Permissions accordées à ce rôle.
     *
     * @return list<Permission>
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Visitor => [],

            self::Reader => [
                Permission::CommentsCreate,
            ],

            self::Moderator => [
                Permission::CommentsCreate,
                Permission::CommentsModerate,
                Permission::UsersView,
            ],

            self::Editor => [
                Permission::CommentsCreate,
                Permission::CommentsModerate,
                Permission::StoriesView,
                Permission::StoriesCreate,
                Permission::StoriesUpdate,
                Permission::StoriesPublish,
                Permission::StoriesDelete,
                Permission::AdminAccess,
            ],

            self::Admin => [
                Permission::CommentsCreate,
                Permission::CommentsModerate,
                Permission::StoriesView,
                Permission::StoriesCreate,
                Permission::StoriesUpdate,
                Permission::StoriesPublish,
                Permission::StoriesDelete,
                Permission::UsersView,
                Permission::UsersManage,
                Permission::AdminAccess,
                Permission::SettingsManage,
            ],

            // Le super admin contourne tout via Gate::before — il a tout par défaut.
            self::SuperAdmin => Permission::cases(),
        };
    }

    public function hasPermission(Permission $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }
}
