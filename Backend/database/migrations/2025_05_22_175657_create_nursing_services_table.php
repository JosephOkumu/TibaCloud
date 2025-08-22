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
        Schema::create('nursing_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('nursing_provider_id')->constrained('nursing_providers')->onDelete('cascade');
            $table->string('service_name');
            $table->text('service_description')->nullable();
            $table->decimal('service_price', 10, 2);
            $table->dateTime('scheduled_datetime');
            $table->dateTime('end_datetime')->nullable(); // For services with duration
            $table->text('patient_address'); // Home address for service
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->text('care_notes')->nullable(); // Notes from nursing staff
            $table->text('patient_requirements')->nullable(); // Special requirements specified by patient
            $table->text('medical_history')->nullable(); // Relevant medical history
            $table->text('doctor_referral')->nullable(); // If the service was referred by a doctor
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_pattern')->nullable(); // e.g., 'daily', 'weekly', etc.
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
        Schema::dropIfExists('nursing_services');
    }
};
