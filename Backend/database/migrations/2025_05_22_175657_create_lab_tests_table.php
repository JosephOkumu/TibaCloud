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
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lab_provider_id')->constrained('lab_providers')->onDelete('cascade');
            $table->string('test_name');
            $table->text('test_description')->nullable();
            $table->decimal('test_price', 10, 2);
            $table->dateTime('scheduled_datetime');
            $table->enum('sample_collection_mode', ['lab_visit', 'home_collection'])->default('lab_visit');
            $table->text('sample_collection_address')->nullable(); // For home collection
            $table->enum('status', ['scheduled', 'sample_collected', 'processing', 'completed', 'cancelled'])->default('scheduled');
            $table->text('results')->nullable(); // Could be JSON or path to PDF results
            $table->dateTime('results_available_at')->nullable();
            $table->text('doctor_referral')->nullable(); // Could store referral note or referral doctor ID
            $table->boolean('is_paid')->default(false);
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('scheduled_datetime');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_tests');
    }
};
