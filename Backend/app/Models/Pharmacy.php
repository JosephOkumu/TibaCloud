<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pharmacy extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'pharmacy_name',
        'description',
        'license_number',
        'logo',
        'address',
        'city',
        'phone_number',
        'email',
        'operating_hours',
        'offers_delivery',
        'delivery_fee',
        'delivery_time_minutes',
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
        'offers_delivery' => 'boolean',
        'delivery_fee' => 'decimal:2',
        'delivery_time_minutes' => 'integer',
        'is_available' => 'boolean',
        'average_rating' => 'integer',
    ];

    /**
     * Get the user that owns the pharmacy.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the medicines for the pharmacy.
     */
    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    /**
     * Get the medicine orders for the pharmacy.
     */
    public function medicineOrders()
    {
        return $this->hasMany(MedicineOrder::class);
    }
}
