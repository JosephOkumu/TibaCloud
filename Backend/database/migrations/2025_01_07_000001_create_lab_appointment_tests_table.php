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
        Schema::create('lab_appointment_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_appointment_id')->constrained('lab_appointments')->onDelete('cascade');
            $table->foreignId('lab_test_service_id')->constrained('lab_test_services')->onDelete('cascade');
            $table->timestamps();

            // Ensure each test can only be added once per appointment
            $table->unique(['lab_appointment_id', 'lab_test_service_id'], 'lab_appt_test_unique');

            // Indexes for better performance
            $table->index(['lab_appointment_id']);
            $table->index(['lab_test_service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_appointment_tests');
    }
};
