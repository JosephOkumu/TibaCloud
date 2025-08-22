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
        Schema::create('medicine_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('medicine_orders')->onDelete('cascade');
            $table->foreignId('medicine_id')->constrained('medicines');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->text('special_instructions')->nullable();
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index(['order_id', 'medicine_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_order_items');
    }
};
