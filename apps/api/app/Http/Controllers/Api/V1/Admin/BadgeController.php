<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\BadgeRarity;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BadgeResource;
use App\Models\Badge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class BadgeController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $badges = Badge::query()->orderBy('sort_order')->get();

        return BadgeResource::collection($badges);
    }

    public function store(Request $request): BadgeResource
    {
        $validated = $request->validate([
            'slug'                 => ['required', 'string', 'unique:badges,slug'],
            'name'                 => ['required', 'string'],
            'description'          => ['required', 'string'],
            'icon'                 => ['required', 'string'],
            'rarity'               => ['required', Rule::enum(BadgeRarity::class)],
            'condition_type'       => ['required', 'string'],
            'condition_value'      => ['nullable', 'integer', 'min:1'],
            'condition_meta'       => ['nullable', 'array'],
            'condition_meta.code'  => ['nullable', 'string', 'max:100'],
            'is_active'            => ['boolean'],
            'sort_order'           => ['integer', 'min:0'],
        ]);

        $badge = Badge::create($validated);

        return new BadgeResource($badge);
    }

    public function update(Request $request, Badge $badge): BadgeResource
    {
        $validated = $request->validate([
            'slug'                 => ['required', 'string', Rule::unique('badges', 'slug')->ignore($badge->id)],
            'name'                 => ['required', 'string'],
            'description'          => ['required', 'string'],
            'icon'                 => ['required', 'string'],
            'rarity'               => ['required', Rule::enum(BadgeRarity::class)],
            'condition_type'       => ['required', 'string'],
            'condition_value'      => ['nullable', 'integer', 'min:1'],
            'condition_meta'       => ['nullable', 'array'],
            'condition_meta.code'  => ['nullable', 'string', 'max:100'],
            'is_active'            => ['boolean'],
            'sort_order'           => ['integer', 'min:0'],
        ]);

        $badge->update($validated);

        return new BadgeResource($badge->fresh());
    }

    public function destroy(Badge $badge): JsonResponse
    {
        $badge->delete();

        return response()->json(null, 204);
    }
}
