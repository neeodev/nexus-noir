<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_hash', 64);
            $table->timestamp('viewed_at')->useCurrent();

            $table->index(['story_id', 'session_hash']);
            $table->index(['story_id', 'viewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_views');
    }
};
