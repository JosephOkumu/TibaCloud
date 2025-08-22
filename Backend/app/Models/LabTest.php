<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'patient_id',
        'lab_provider_id',
        'test_name',
        'test_description',
        'test_price',
        'scheduled_datetime',
        'sample_collection_mode',
        'sample_collection_address',
        'status',
        'results',
        'results_available_at',
        'doctor_referral',
        'is_paid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_datetime' => 'datetime',
        'test_price' => 'decimal:2',
        'results' => 'json',
        'results_available_at' => 'datetime',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the patient that owns the lab test.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the lab provider that owns the lab test.
     */
    public function labProvider()
    {
        return $this->belongsTo(LabProvider::class);
    }
}
