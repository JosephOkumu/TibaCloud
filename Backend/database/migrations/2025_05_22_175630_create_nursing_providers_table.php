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
        Schema::create('nursing_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('provider_name');
            $table->text('description');
            $table->string('license_number')->unique();
            $table->text('qualifications');
            $table->text('services_offered'); // JSON encoded list of services
            $table->text('service_areas')->nullable(); // JSON encoded geographic areas served
            $table->string('logo')->nullable();
            $table->decimal('base_rate_per_hour', 10, 2);
            $table->boolean('is_available')->default(true);
            $table->integer('average_rating')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_providers');
    }
};
