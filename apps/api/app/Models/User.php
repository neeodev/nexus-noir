<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Permission;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\UserBadge;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'banned_at', 'ban_reason'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'banned_at'         => 'datetime',
            'password'          => 'hashed',
            'role'              => UserRole::class,
        ];
    }

    public function isBanned(): bool
    {
        return $this->banned_at !== null;
    }

    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }

    /** Vrai si l'utilisateur a au moins le niveau hiérarchique du rôle donné. */
    public function hasAtLeastRole(UserRole $role): bool
    {
        return $this->role->level() >= $role->level();
    }

    public function hasPermission(Permission $permission): bool
    {
        // Le super admin a tout (cohérent avec Gate::before).
        if ($this->role === UserRole::SuperAdmin) {
            return true;
        }

        return $this->role->hasPermission($permission);
    }

    public function views(): HasMany
    {
        return $this->hasMany(StoryView::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->using(UserBadge::class)
            ->withPivot('awarded_at')
            ->orderBy('sort_order');
    }
}
