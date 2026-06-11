<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOndelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->string('summary_short', 500)->nullable();
            $table->text('summary_long')->nullable();
            $table->string('cover_image')->nullable();

            $table->string('status')->default(\App\Enums\StoryStatus::Draft->value)->index();
            $table->string('visibility')->default(\App\Enums\StoryVisibility::Public->value)->index();

            // Contenu source : document structure en blocs. Le rendu derive de ce JSON.
            $table->jsonb('content')->nullable();

            $table->unsignedInteger('reading_time')->default(0); // minutes estimees
            $table->unsignedInteger('word_count')->default(0);
            $table->unsignedInteger('version')->default(1);

            $table->jsonb('tags')->nullable();
            $table->jsonb('content_warnings')->nullable();

            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
