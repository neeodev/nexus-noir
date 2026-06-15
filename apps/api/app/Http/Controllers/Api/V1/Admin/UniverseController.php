<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UniverseEntryType;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UniverseEntryResource;
use App\Models\Story;
use App\Models\UniverseEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UniverseController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UniverseEntryResource::collection(
            UniverseEntry::orderBy('type')->orderBy('sort_order')->orderBy('name')->get()
        );
    }

    public function show(UniverseEntry $universeEntry): UniverseEntryResource
    {
        $universeEntry->load(['stories:id,slug,title', 'related']);
        $universeEntry->setRelation('_detail', true);
        return new UniverseEntryResource($universeEntry);
    }

    public function store(Request $request): UniverseEntryResource
    {
        $validated = $this->validate($request);
        $entry = UniverseEntry::create($validated);
        $this->syncRelations($entry, $request);
        return new UniverseEntryResource($entry->load(['stories:id,slug,title', 'related']));
    }

    public function update(Request $request, UniverseEntry $universeEntry): UniverseEntryResource
    {
        $validated = $this->validate($request);
        $universeEntry->update($validated);
        $this->syncRelations($universeEntry, $request);
        $universeEntry->setRelation('_detail', true);
        return new UniverseEntryResource($universeEntry->load(['stories:id,slug,title', 'related']));
    }

    public function destroy(UniverseEntry $universeEntry): JsonResponse
    {
        $universeEntry->delete();
        return response()->json(['message' => 'Entrée supprimée.']);
    }

    private function validate(Request $request): array
    {
        return $request->validate([
            'type'             => ['required', Rule::enum(UniverseEntryType::class)],
            'name'             => ['required', 'string', 'max:200'],
            'slug'             => ['nullable', 'string', 'max:200'],
            'summary'          => ['nullable', 'string', 'max:1000'],
            'content'          => ['nullable', 'array'],
            'meta'             => ['nullable', 'array'],
            'cover_image'      => ['nullable', 'string', 'max:500'],
            'is_hidden'        => ['boolean'],
            'unlock_condition' => ['nullable', 'array'],
            'sort_order'       => ['integer', 'min:0'],
        ]) + ['slug' => Str::slug($request->string('name')->toString())];
    }

    private function syncRelations(UniverseEntry $entry, Request $request): void
    {
        if ($request->has('story_ids')) {
            $ids = Story::whereIn('id', (array) $request->input('story_ids'))->pluck('id');
            $entry->stories()->sync($ids);
        }

        if ($request->has('related_ids')) {
            $related = collect((array) $request->input('related_ids'))
                ->mapWithKeys(fn ($id) => [$id => ['relation_type' => 'related']]);
            $entry->related()->sync($related);
        }
    }
}
