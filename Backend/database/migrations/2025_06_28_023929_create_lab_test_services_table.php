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
        Schema::create('lab_test_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_provider_id')->constrained()->onDelete('cascade');
            $table->string('test_name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('turnaround_time')->nullable(); // e.g., "2 hours", "24 hours"
            $table->string('sample_type')->nullable(); // e.g., "Blood", "Urine", "Saliva"
            $table->text('preparation_instructions')->nullable(); // e.g., "Fast for 8 hours"
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes for better performance
            $table->index(['lab_provider_id', 'is_active']);
            $table->index('test_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_test_services');
    }
};
