<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserAdminResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()->orderByDesc('created_at');

        if ($search = $request->string('q')->toString()) {
            $query->where(fn ($q) =>
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
            );
        }

        if ($role = $request->string('role')->toString()) {
            $query->where('role', $role);
        }

        match ($request->string('status')->toString()) {
            'banned' => $query->whereNotNull('banned_at'),
            'active' => $query->whereNull('banned_at'),
            default  => null,
        };

        return UserAdminResource::collection(
            $query->withCount(['badges', 'views'])->paginate(30)->withQueryString()
        );
    }

    public function show(User $user): UserAdminResource
    {
        $user->load('badges');
        return new UserAdminResource($user);
    }

    public function update(Request $request, User $user): UserAdminResource
    {
        $validated = $request->validate([
            'role' => ['required', Rule::enum(UserRole::class)->except(UserRole::Visitor)],
        ]);

        // Empêche de rétrograder le dernier super_admin.
        if ($user->role === UserRole::SuperAdmin && $validated['role'] !== UserRole::SuperAdmin->value) {
            $remaining = User::where('role', UserRole::SuperAdmin)->count();
            abort_if($remaining <= 1, 422, 'Impossible de rétrograder le dernier super administrateur.');
        }

        $user->update(['role' => $validated['role']]);

        return new UserAdminResource($user);
    }

    public function ban(Request $request, User $user): UserAdminResource
    {
        abort_if($user->role === UserRole::SuperAdmin, 403, 'Impossible de bannir un super administrateur.');

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update([
            'banned_at'  => now(),
            'ban_reason' => $validated['reason'] ?? null,
        ]);

        return new UserAdminResource($user);
    }

    public function unban(User $user): UserAdminResource
    {
        $user->update(['banned_at' => null, 'ban_reason' => null]);
        return new UserAdminResource($user);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'Impossible de supprimer votre propre compte.');
        abort_if($user->role === UserRole::SuperAdmin, 403, 'Impossible de supprimer un super administrateur.');

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
