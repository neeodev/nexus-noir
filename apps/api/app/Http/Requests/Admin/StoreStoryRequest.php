<?php

namespace App\Http\Requests\Admin;

use App\Enums\StoryStatus;
use App\Enums\StoryVisibility;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // l'autorisation fine est gérée par la permission de route
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('stories', 'slug')],
            'summaryShort' => ['nullable', 'string', 'max:500'],
            'summaryLong' => ['nullable', 'string', 'max:5000'],
            'coverImage' => ['nullable', 'string', 'max:2048'],
            'status' => ['sometimes', new Enum(StoryStatus::class)],
            'visibility' => ['sometimes', new Enum(StoryVisibility::class)],
            'content' => ['nullable', 'array'],
            'content.type' => ['required_with:content', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'contentWarnings' => ['nullable', 'array'],
            'contentWarnings.*' => ['string', 'max:100'],
            'universe_entry_ids' => ['nullable', 'array'],
            'universe_entry_ids.*' => ['integer', 'exists:universe_entries,id'],
        ];
    }
}
