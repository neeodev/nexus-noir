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
        Schema::create('universe_entry_relations', function (Blueprint $table) {
            $table->foreignId('entry_id')->constrained('universe_entries')->cascadeOnDelete();
            $table->foreignId('related_id')->constrained('universe_entries')->cascadeOnDelete();
            $table->string('relation_type')->default('related'); // related | member_of | located_in | opposes
            $table->primary(['entry_id', 'related_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('universe_entry_relations');
    }
};
