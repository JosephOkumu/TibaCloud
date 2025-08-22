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
        Schema::create('lab_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('lab_name');
            $table->string('license_number')->unique();
            $table->string('website')->nullable();
            $table->text('address');
            $table->text('operating_hours')->nullable(); // JSON encoded operating hours
            $table->text('description')->nullable();
            $table->string('contact_person_name')->nullable();
            $table->string('contact_person_role')->nullable();
            $table->string('profile_image')->nullable();
            $table->text('certifications')->nullable(); // JSON encoded certifications
            $table->boolean('is_available')->default(true);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_providers');
    }
};
