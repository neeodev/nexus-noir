<?php

namespace Database\Factories;

use App\Enums\StoryStatus;
use App\Enums\StoryVisibility;
use App\Models\Story;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Story>
 */
class StoryFactory extends Factory
{
    public function definition(): array
    {
        $title = rtrim($this->faker->sentence(4), '.');

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.$this->faker->unique()->numberBetween(1, 99999),
            'summary_short' => $this->faker->sentence(12),
            'summary_long' => $this->faker->paragraph(),
            'cover_image' => null,
            'status' => StoryStatus::Draft,
            'visibility' => StoryVisibility::Public,
            'content' => ['version' => 1, 'blocks' => []],
            'reading_time' => $this->faker->numberBetween(2, 25),
            'word_count' => $this->faker->numberBetween(400, 6000),
            'version' => 1,
            'tags' => [],
            'content_warnings' => [],
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => StoryStatus::Published,
            'visibility' => StoryVisibility::Public,
            'published_at' => now()->subDays($this->faker->numberBetween(0, 30)),
        ]);
    }
}
