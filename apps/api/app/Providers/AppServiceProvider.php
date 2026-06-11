<?php

namespace App\Providers;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Le super admin contourne toutes les vérifications de permission.
        Gate::before(function (User $user) {
            return $user->role === UserRole::SuperAdmin ? true : null;
        });

        // Chaque permission devient une "ability" : $user->can('stories.publish'),
        // middleware can:stories.publish, @can en Blade, etc.
        foreach (Permission::cases() as $permission) {
            Gate::define($permission->value, function (User $user) use ($permission) {
                return $user->hasPermission($permission);
            });
        }
    }
}
