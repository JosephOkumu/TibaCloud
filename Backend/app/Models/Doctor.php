<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'specialty',
        'description',
        'professional_summary',
        'years_of_experience',
        'location',
        'hospital',
        'license_number',
        'experience',
        'default_consultation_fee',
        'physical_consultation_fee',
        'online_consultation_fee',
        'profile_image',
        'bio',
        'languages',
        'accepts_insurance',
        'consultation_modes',
        'availability',
        'is_available_for_consultation',
        'average_rating',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'availability' => 'json',
        'consultation_modes' => 'json',
        'is_available_for_consultation' => 'boolean',
        'accepts_insurance' => 'boolean',
        'default_consultation_fee' => 'decimal:2',
        'physical_consultation_fee' => 'decimal:2',
        'online_consultation_fee' => 'decimal:2',
        'average_rating' => 'integer',
    ];

    /**
     * Get the appointments for the doctor.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the user that owns the doctor profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
