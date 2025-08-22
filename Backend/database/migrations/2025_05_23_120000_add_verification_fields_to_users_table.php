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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'license_number')) {
                $table->string('license_number')->nullable()->after('phone_number');
            }
            
            if (!Schema::hasColumn('users', 'national_id')) {
                $table->string('national_id')->nullable()->after('license_number');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'license_number')) {
                $table->dropColumn('license_number');
            }
            
            if (Schema::hasColumn('users', 'national_id')) {
                $table->dropColumn('national_id');
            }
        });
    }
};
