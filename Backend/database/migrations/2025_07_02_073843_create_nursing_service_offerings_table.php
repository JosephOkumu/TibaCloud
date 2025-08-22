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
        Schema::create('nursing_service_offerings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nursing_provider_id')->constrained('nursing_providers')->onDelete('cascade');
            $table->string('name'); // Service name
            $table->text('description'); // Service description
            $table->string('location'); // Service area/location
            $table->string('availability'); // Availability schedule
            $table->string('experience'); // Experience level
            $table->decimal('price', 10, 2); // Service price
            $table->boolean('is_active')->default(true); // Is service active
            $table->timestamps();

            // Indexes for faster queries
            $table->index('nursing_provider_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_service_offerings');
    }
};
