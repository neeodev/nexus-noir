<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UniverseEntryResource;
use App\Models\UniverseEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UniverseController extends Controller
{
    /** Liste publique — entrées non cachées, regroupées par type. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = UniverseEntry::query()->orderBy('sort_order')->orderBy('name');

        // Les entrées cachées ne sont montrées que si l'utilisateur a rempli la condition.
        if (! $request->user()?->hasPermission(\App\Enums\Permission::AdminAccess)) {
            $query->where('is_hidden', false);
        }

        if ($type = $request->string('type')->toString()) {
            $query->where('type', $type);
        }

        return UniverseEntryResource::collection($query->get());
    }

    /** Détail d'une entrée, avec contenu complet, nouvelles et entrées liées. */
    public function show(Request $request, string $slug): UniverseEntryResource
    {
        $entry = UniverseEntry::where('slug', $slug)
            ->with(['stories:id,slug,title', 'related'])
            ->firstOrFail();

        // Entrée cachée : vérifier la condition avant de dévoiler le contenu.
        $user = $request->user();
        if ($entry->is_hidden) {
            $condition = $entry->unlock_condition ?? [];
            $unlocked = match ($condition['type'] ?? null) {
                'badge'      => $user?->badges()->where('slug', $condition['value'] ?? '')->exists(),
                'story_read' => $user?->views()
                    ->whereHas('story', fn ($q) => $q->where('slug', $condition['value'] ?? ''))
                    ->exists(),
                default      => $user?->hasPermission(\App\Enums\Permission::AdminAccess) ?? false,
            };

            if (! $unlocked) {
                abort(403, 'Cette archive est classifiée.');
            }
        }

        // On passe par un attribut virtuel pour déclencher le `whenLoaded` du content.
        $entry->setRelation('_detail', true);

        return new UniverseEntryResource($entry);
    }
}
