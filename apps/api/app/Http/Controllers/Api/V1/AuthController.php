<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Support\BadgeAwarder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Inscription + connexion immediate (session SPA). */
    public function register(RegisterRequest $request): UserResource
    {
        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => Hash::make((string) $request->string('password')),
        ]);

        Auth::login($user);
        $request->session()->regenerate();
        BadgeAwarder::onRegister($user);

        return new UserResource($user);
    }

    /** Connexion par session (cookies Sanctum). */
    public function login(LoginRequest $request): UserResource
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, remember: true)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        return new UserResource(Auth::user());
    }

    /** Deconnexion : invalide la session. */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Deconnecte.']);
    }

    /** Utilisateur courant. */
    public function user(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
