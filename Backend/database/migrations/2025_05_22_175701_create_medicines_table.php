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
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pharmacy_id')->constrained('pharmacies')->onDelete('cascade');
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->text('description')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('category');
            $table->decimal('price', 10, 2);
            $table->string('dosage_form'); // tablet, capsule, syrup, etc.
            $table->string('strength')->nullable(); // e.g., 500mg, 250ml
            $table->boolean('requires_prescription')->default(false);
            $table->boolean('is_available')->default(true);
            $table->integer('stock_quantity')->default(0);
            $table->string('image')->nullable();
            $table->text('side_effects')->nullable();
            $table->text('contraindications')->nullable();
            $table->text('storage_instructions')->nullable();
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('name');
            $table->index('category');
            $table->index('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
