<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NursingProvider extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'provider_name',
        'description',
        'license_number',
        'qualifications',
        'services_offered',
        'service_areas',
        'logo',
        'base_rate_per_hour',
        'is_available',
        'average_rating',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'services_offered' => 'json',
        'service_areas' => 'json',
        'base_rate_per_hour' => 'decimal:2',
        'is_available' => 'boolean',
        'average_rating' => 'integer',
    ];

    /**
     * Get the user that owns the nursing provider.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the nursing services for the nursing provider.
     */
    public function nursingServices()
    {
        return $this->hasMany(NursingService::class);
    }

    /**
     * Get the service offerings for the nursing provider.
     */
    public function nursingServiceOfferings()
    {
        return $this->hasMany(NursingServiceOffering::class);
    }
}
