<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabProvider extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'lab_name',
        'license_number',
        'website',
        'address',
        'operating_hours',
        'description',
        'contact_person_name',
        'contact_person_role',
        'profile_image',
        'certifications',
        'is_available',
        'average_rating',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'operating_hours' => 'json',
        'certifications' => 'json',
        'is_available' => 'boolean',
        'average_rating' => 'decimal:2',
    ];

    /**
     * Get the user that owns the lab provider.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the lab tests for the lab provider.
     */
    public function labTests()
    {
        return $this->hasMany(LabTest::class);
    }

    /**
     * Get the test services offered by this lab provider.
     */
    public function testServices()
    {
        return $this->hasMany(LabTestService::class);
    }

    /**
     * Get only active test services.
     */
    public function activeTestServices()
    {
        return $this->hasMany(LabTestService::class)->where('is_active', true)->orderBy('sort_order');
    }
}
