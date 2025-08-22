<?php

namespace App\Http\Controllers;

use App\Models\LabProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class LabProviderController extends Controller
{
    /**
     * Display a listing of the lab providers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $labProviders = LabProvider::with('user')->get();

        return response()->json([
            'status' => 'success',
            'data' => $labProviders
        ]);
    }

    /**
     * Store a newly created lab provider in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'lab_name' => 'required|string|max:255',
            'license_number' => 'required|string|unique:lab_providers,license_number',
            'website' => 'nullable|url|max:255',
            'address' => 'required|string',
            'operating_hours' => 'nullable|json',
            'description' => 'nullable|string',
            'contact_person_name' => 'nullable|string|max:255',
            'contact_person_role' => 'nullable|string|max:255',
            'profile_image' => 'nullable|string',
            'certifications' => 'nullable|json',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $labProvider = LabProvider::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Lab provider created successfully',
            'data' => $labProvider->load('user')
        ], 201);
    }

    /**
     * Display the specified lab provider.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $labProvider = LabProvider::with('user')->find($id);

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $labProvider
        ]);
    }

    /**
     * Update the specified lab provider in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'exists:users,id',
            'lab_name' => 'string|max:255',
            'license_number' => 'string|unique:lab_providers,license_number,'.$id,
            'website' => 'nullable|url|max:255',
            'address' => 'string',
            'operating_hours' => 'nullable|json',
            'description' => 'nullable|string',
            'contact_person_name' => 'nullable|string|max:255',
            'contact_person_role' => 'nullable|string|max:255',
            'profile_image' => 'nullable|string',
            'certifications' => 'nullable|json',
            'is_available' => 'boolean',
            'average_rating' => 'numeric|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $labProvider = LabProvider::find($id);

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider not found'
            ], 404);
        }

        $labProvider->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Lab provider updated successfully',
            'data' => $labProvider->load('user')
        ]);
    }

    /**
     * Debug method to test authentication and user info
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function debug()
    {
        $user = Auth::user();

        return response()->json([
            'authenticated' => !!$user,
            'user' => $user,
            'lab_providers_count' => LabProvider::count(),
            'user_lab_provider' => $user ? LabProvider::where('user_id', $user->id)->first() : null
        ]);
    }

    /**
     * Get the current authenticated lab provider's profile
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
                'debug' => [
                    'authenticated' => false,
                    'middleware' => 'auth:sanctum should be working'
                ]
            ], 401);
        }

        $labProvider = LabProvider::where('user_id', $user->id)->with('user')->first();

        if (!$labProvider) {
            // Create a default lab provider profile if none exists
            $labProvider = LabProvider::create([
                'user_id' => $user->id,
                'lab_name' => $user->name . ' Laboratory',
                'license_number' => 'LAB-' . $user->id . '-' . date('Y'),
                'address' => 'Address not set',
                'is_available' => true,
                'average_rating' => 0.00
            ]);
            $labProvider->load('user');
        }

        return response()->json([
            'status' => 'success',
            'data' => $labProvider
        ]);
    }

    /**
     * Update the current authenticated lab provider's profile
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
                'message' => 'Unauthorized'
            ], 401);
        }

        $labProvider = LabProvider::where('user_id', $user->id)->first();

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'lab_name' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|unique:lab_providers,license_number,'.$labProvider->id,
            'website' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'operating_hours' => 'nullable|string',
            'description' => 'nullable|string',
            'contact_person_name' => 'nullable|string|max:255',
            'contact_person_role' => 'nullable|string|max:255',
            'profile_image' => 'nullable|string',
            'certifications' => 'nullable|array',
            'certifications.*' => 'string',
            'is_available' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Prepare data for update
        $updateData = $request->only([
            'lab_name',
            'license_number',
            'website',
            'address',
            'operating_hours',
            'description',
            'contact_person_name',
            'contact_person_role',
            'profile_image',
            'is_available'
        ]);

        // Handle certifications array conversion to JSON
        if ($request->has('certifications')) {
            $updateData['certifications'] = json_encode($request->certifications);
        }

        $labProvider->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => $labProvider->load('user')
        ]);
    }

    /**
     * Upload profile image for the authenticated lab provider
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
                'message' => 'Unauthorized'
            ], 401);
        }

        $labProvider = LabProvider::where('user_id', $user->id)->first();

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider profile not found'
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
            $image = $request->file('profile_image');
            $imageName = 'lab_' . $labProvider->id . '_' . time() . '.' . $image->getClientOriginalExtension();

            // Store in public/storage/lab_images directory
            $imagePath = $image->storeAs('lab_images', $imageName, 'public');

            // Get the full URL
            $imageUrl = url('storage/' . $imagePath);

            // Update lab provider profile
            $labProvider->update(['profile_image' => $imageUrl]);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile image uploaded successfully',
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
     * Remove the specified lab provider from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $labProvider = LabProvider::find($id);

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider not found'
            ], 404);
        }

        $labProvider->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lab provider deleted successfully'
        ]);
    }

    /**
     * Get occupied dates for a specific lab provider
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOccupiedDates($id)
    {
        $labProvider = LabProvider::find($id);

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider not found'
            ], 404);
        }

        try {
            // Get all confirmed lab tests for this provider
            $occupiedDates = \DB::table('lab_tests')
                ->where('lab_provider_id', $id)
                ->where('status', 'confirmed')
                ->whereDate('test_date', '>=', now()->toDateString())
                ->select(\DB::raw('DATE(test_date) as date'))
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
     * Get occupied time slots for a specific lab provider on a specific date
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOccupiedTimes($id, Request $request)
    {
        $labProvider = LabProvider::find($id);

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider not found'
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

            // Get all confirmed lab tests for this provider on the specified date
            $occupiedTimes = \DB::table('lab_tests')
                ->where('lab_provider_id', $id)
                ->where('status', 'confirmed')
                ->whereDate('test_date', $date)
                ->select(\DB::raw('TIME_FORMAT(test_date, "%h:%i %p") as time'))
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
