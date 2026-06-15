<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->string('cover_image', 500)->nullable();
            $table->boolean('is_completed')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('series_story', function (Blueprint $table) {
            $table->foreignId('series_id')->constrained('series')->cascadeOnDelete();
            $table->foreignId('story_id')->constrained('stories')->cascadeOnDelete();
            $table->integer('position')->default(0);
            $table->primary(['series_id', 'story_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_story');
        Schema::dropIfExists('series');
    }
};
