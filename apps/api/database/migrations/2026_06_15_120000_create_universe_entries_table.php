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
        Schema::create('universe_entries', function (Blueprint $table) {
            $table->id();
            $table->string('type');            // character | place | faction | event | concept
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->jsonb('content')->nullable();  // blocs rich-text (même format que les nouvelles)
            $table->jsonb('meta')->nullable();     // données spécifiques au type
            $table->string('cover_image')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->jsonb('unlock_condition')->nullable(); // { type: "badge"|"story_read", value: "slug" }
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['type', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('universe_entries');
    }
};
