<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Super Admin',
            'role' => UserRole::SuperAdmin,
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        User::firstOrCreate(['email' => 'test@example.com'], [
            'name' => 'Test User',
            'role' => UserRole::Reader,
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        $this->call(StorySeeder::class);
        $this->call(BadgeSeeder::class);
    }
}
