<?php

namespace App\Http\Requests\Comments;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:1', 'max:2000'],
            // Réponse à un commentaire existant (l'appartenance à la nouvelle
            // est revérifiée dans le contrôleur).
            'parentId' => ['nullable', 'integer', 'exists:comments,id'],
        ];
    }
}
