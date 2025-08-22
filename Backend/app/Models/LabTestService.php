<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTestService extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'lab_provider_id',
        'test_name',
        'description',
        'price',
        'turnaround_time',
        'sample_type',
        'preparation_instructions',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the lab provider that owns this test service.
     */
    public function labProvider()
    {
        return $this->belongsTo(LabProvider::class);
    }

    /**
     * Scope a query to only include active test services.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include test services for a specific lab provider.
     */
    public function scopeForProvider($query, $labProviderId)
    {
        return $query->where('lab_provider_id', $labProviderId);
    }

    /**
     * Get formatted price with currency.
     */
    public function getFormattedPriceAttribute()
    {
        return 'KES ' . number_format($this->price, 2);
    }

    /**
     * Search test services by name.
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('test_name', 'like', '%' . $searchTerm . '%')
                    ->orWhere('description', 'like', '%' . $searchTerm . '%');
    }
}
