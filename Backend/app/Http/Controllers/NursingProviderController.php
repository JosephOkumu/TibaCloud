<?php

namespace App\Http\Controllers;

use App\Models\NursingProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class NursingProviderController extends Controller
{
    /**
     * Display a listing of the nursing providers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $nursingProviders = NursingProvider::with(['user', 'nursingServiceOfferings'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $nursingProviders
        ]);
    }

    /**
     * Store a newly created nursing provider in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'provider_name' => 'required|string|max:255',
            'description' => 'required|string',
            'license_number' => 'required|string|unique:nursing_providers,license_number',
            'qualifications' => 'required|string',
            'services_offered' => 'required|json',
            'service_areas' => 'nullable|json',
            'logo' => 'nullable|string',
            'base_rate_per_hour' => 'required|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $nursingProvider = NursingProvider::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Nursing provider created successfully',
            'data' => $nursingProvider
        ], 201);
    }

    /**
     * Display the specified nursing provider.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $nursingProvider = NursingProvider::with(['user', 'nursingServiceOfferings'])->find($id);

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $nursingProvider
        ]);
    }

    /**
     * Update the specified nursing provider in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'exists:users,id',
            'provider_name' => 'string|max:255',
            'description' => 'string',
            'license_number' => 'string|unique:nursing_providers,license_number,'.$id,
            'qualifications' => 'string',
            'services_offered' => 'json',
            'service_areas' => 'nullable|json',
            'logo' => 'nullable|string',
            'base_rate_per_hour' => 'numeric|min:0',
            'is_available' => 'boolean',
            'average_rating' => 'integer|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $nursingProvider = NursingProvider::find($id);

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider not found'
            ], 404);
        }

        $nursingProvider->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Nursing provider updated successfully',
            'data' => $nursingProvider
        ]);
    }

    /**
     * Remove the specified nursing provider from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $nursingProvider = NursingProvider::find($id);

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider not found'
            ], 404);
        }

        $nursingProvider->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Nursing provider deleted successfully'
        ]);
    }

    /**
     * Get the current nursing provider's profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $nursingProvider = NursingProvider::with('user')->where('user_id', $user->id)->first();

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider profile not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $nursingProvider
        ]);
    }

    /**
     * Update the current nursing provider's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $nursingProvider = NursingProvider::where('user_id', $user->id)->first();

        $isCreating = !$nursingProvider;

        $validationRules = [
            'name' => 'string|max:255',
            'provider_name' => 'string|max:255',
            'description' => 'string',
            'location' => 'string|max:255',
            'availability' => 'string|max:255',
            'experience' => 'string',
            'qualifications' => 'string',
            'services_offered' => 'string',
            'base_rate_per_hour' => 'numeric|min:0',
            'phone_number' => 'string|max:20',
            'email' => 'email|max:255',
        ];

        // If creating, make certain fields required
        if ($isCreating) {
            $validationRules['provider_name'] = 'required|string|max:255';
            $validationRules['description'] = 'required|string';
            $validationRules['base_rate_per_hour'] = 'required|numeric|min:0';
        }

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user data if provided
        $userData = [];
        if ($request->has('name')) {
            $userData['name'] = $request->name;
        }
        if ($request->has('phone_number')) {
            $userData['phone_number'] = $request->phone_number;
        }
        if ($request->has('email')) {
            $userData['email'] = $request->email;
        }

        if (!empty($userData)) {
            $user->update($userData);
        }

        // Update nursing provider data
        $providerData = [];
        if ($request->has('provider_name')) {
            $providerData['provider_name'] = $request->provider_name;
        }
        if ($request->has('description')) {
            $providerData['description'] = $request->description;
        }
        if ($request->has('qualifications')) {
            $providerData['qualifications'] = $request->qualifications;
        }
        if ($request->has('services_offered')) {
            $providerData['services_offered'] = $request->services_offered;
        }
        if ($request->has('base_rate_per_hour')) {
            $providerData['base_rate_per_hour'] = $request->base_rate_per_hour;
        }

        if ($isCreating) {
            // Create new nursing provider profile
            $providerData['user_id'] = $user->id;
            $providerData['license_number'] = $providerData['license_number'] ?? 'NP_' . time();
            $providerData['provider_name'] = $providerData['provider_name'] ?? $request->name ?? 'Nursing Provider';
            $providerData['description'] = $providerData['description'] ?? 'Professional nursing services';
            $providerData['base_rate_per_hour'] = $providerData['base_rate_per_hour'] ?? 1000;
            $providerData['qualifications'] = $providerData['qualifications'] ?? 'Professional nursing qualifications';
            $providerData['services_offered'] = $providerData['services_offered'] ?? 'Home nursing services';

            $nursingProvider = NursingProvider::create($providerData);
        } else {
            // Update existing profile
            if (!empty($providerData)) {
                $nursingProvider->update($providerData);
            }
        }

        // Reload with relationships
        $nursingProvider = $nursingProvider->fresh('user');

        return response()->json([
            'status' => 'success',
            'message' => $isCreating ? 'Profile created successfully' : 'Profile updated successfully',
            'data' => $nursingProvider
        ]);
    }

    /**
     * Upload profile image for the current nursing provider.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadProfileImage(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $nursingProvider = NursingProvider::where('user_id', $user->id)->first();

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Delete old image if exists
            if ($nursingProvider->logo) {
                $oldImagePath = str_replace(url('storage/'), '', $nursingProvider->logo);
                if (Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }

            // Store new image
            $image = $request->file('profile_image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('nursing_providers/profiles', $imageName, 'public');
            $imageUrl = url('storage/' . $imagePath);

            // Update nursing provider record
            $nursingProvider->update(['logo' => $imageUrl]);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile image updated successfully',
                'data' => [
                    'profile_image' => $imageUrl
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get occupied dates for a specific nursing provider
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOccupiedDates($id)
    {
        $nursingProvider = NursingProvider::find($id);

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider not found'
            ], 404);
        }

        try {
            // Get all confirmed nursing services for this provider
            $occupiedDates = \DB::table('nursing_services')
                ->where('nursing_provider_id', $id)
                ->where('status', 'confirmed')
                ->whereDate('start_date', '>=', now()->toDateString())
                ->select(\DB::raw('DATE(start_date) as date'))
                ->distinct()
                ->pluck('date')
                ->toArray();

            return response()->json([
                'status' => 'success',
                'data' => $occupiedDates
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch occupied dates: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get occupied time slots for a specific nursing provider on a specific date
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOccupiedTimes($id, Request $request)
    {
        $nursingProvider = NursingProvider::find($id);

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $date = $request->get('date');

            // Get all confirmed nursing services for this provider on the specified date
            $occupiedTimes = \DB::table('nursing_services')
                ->where('nursing_provider_id', $id)
                ->where('status', 'confirmed')
                ->whereDate('start_date', $date)
                ->select(\DB::raw('TIME_FORMAT(start_date, "%h:%i %p") as time'))
                ->pluck('time')
                ->toArray();

            return response()->json([
                'status' => 'success',
                'data' => $occupiedTimes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch occupied times: ' . $e->getMessage()
            ], 500);
        }
    }
}
