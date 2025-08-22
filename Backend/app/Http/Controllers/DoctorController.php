<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DoctorController extends Controller
{
    /**
     * Display a listing of the doctors.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $doctors = Doctor::with('user')->get();

        return response()->json([
            'status' => 'success',
            'data' => $doctors
        ]);
    }

    /**
     * Store a newly created doctor in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'specialty' => 'required|string|max:255',
            'license_number' => 'required|string|unique:doctors,license_number',
            'experience' => 'nullable|string',
            'consultation_fee' => 'required|numeric|min:0',
            'availability' => 'nullable|json',
            'is_available_for_consultation' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $doctor = Doctor::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Doctor created successfully',
            'data' => $doctor
        ], 201);
    }

    /**
     * Display the specified doctor.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $doctor = Doctor::with('user')->find($id);

        if (!$doctor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $doctor
        ]);
    }

    /**
     * Update the specified doctor in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'exists:users,id',
            'specialty' => 'string|max:255',
            'license_number' => 'string|unique:doctors,license_number,'.$id,
            'experience' => 'nullable|string',
            'consultation_fee' => 'numeric|min:0',
            'availability' => 'nullable|json',
            'is_available_for_consultation' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor not found'
            ], 404);
        }

        $doctor->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Doctor updated successfully',
            'data' => $doctor
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
            'doctors_count' => Doctor::count(),
            'user_doctor' => $user ? Doctor::where('user_id', $user->id)->first() : null
        ]);
    }

    /**
     * Get the current authenticated doctor's profile
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $doctor = Doctor::where('user_id', $user->id)->with('user')->first();

        if (!$doctor) {
            // Create a default doctor profile if none exists
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'specialty' => 'General Practitioner',
                'license_number' => 'DOC-' . $user->id . '-' . date('Y'),
                'default_consultation_fee' => 2500.00,
                'is_available_for_consultation' => true,
                'average_rating' => 0
            ]);
            $doctor->load('user');
        }

        return response()->json([
            'status' => 'success',
            'data' => $doctor
        ]);
    }

    /**
     * Update the current authenticated doctor's profile
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

        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor profile not found'
            ], 404);
        }

        // Debug request data
        Log::info('Doctor Profile Update Request:', [
            'request_data' => $request->all(),
            'user_id' => $user->id,
            'doctor_id' => $doctor->id
        ]);

        // More permissive validation rules
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:500',
            'specialty' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:5000',
            'hospital' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:500',
            'availability' => 'nullable|string|max:1000',
            'experience' => 'nullable', // Accept both string and numeric
            'physicalPrice' => 'nullable|numeric|min:0|max:999999',
            'onlinePrice' => 'nullable|numeric|min:0|max:999999',
            'languages' => 'nullable|string|max:500',
            'acceptsInsurance' => 'nullable|boolean',
            'consultationModes' => 'nullable|array|max:20',
            'consultationModes.*' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            Log::error('Doctor Profile Validation Failed:', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->all(),
                'request_types' => array_map('gettype', $request->all())
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'debug_request_data' => $request->all(),
                'debug_request_types' => array_map('gettype', $request->all())
            ], 422);
        }

        // Map form fields to database fields
        $updateData = [];

        if ($request->has('specialty')) {
            $updateData['specialty'] = $request->specialty;
        }
        if ($request->has('description')) {
            $updateData['description'] = $request->description;
            $updateData['professional_summary'] = $request->description;
            $updateData['bio'] = $request->description;
        }
        if ($request->has('hospital')) {
            $updateData['hospital'] = $request->hospital;
        }
        if ($request->has('location')) {
            $updateData['location'] = $request->location;
        }
        if ($request->has('availability')) {
            $updateData['availability'] = $request->availability;
        }
        if ($request->has('experience')) {
            $experienceValue = is_numeric($request->experience) ? (string)$request->experience : $request->experience;
            $updateData['experience'] = $experienceValue;
            $updateData['years_of_experience'] = $experienceValue;
        }
        if ($request->has('physicalPrice')) {
            $updateData['physical_consultation_fee'] = $request->physicalPrice;
            $updateData['default_consultation_fee'] = $request->physicalPrice;
        }
        if ($request->has('onlinePrice')) {
            $updateData['online_consultation_fee'] = $request->onlinePrice;
        }
        if ($request->has('languages')) {
            $updateData['languages'] = $request->languages;
        }
        if ($request->has('acceptsInsurance')) {
            $updateData['accepts_insurance'] = $request->acceptsInsurance;
        }
        if ($request->has('consultationModes')) {
            $updateData['consultation_modes'] = json_encode($request->consultationModes);
        }

        // Update user name if provided
        if ($request->has('name')) {
            try {
                $user->update(['name' => $request->name]);
            } catch (\Exception $e) {
                Log::error('Failed to update user name:', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id
                ]);
            }
        }

        try {
            $doctor->update($updateData);

            Log::info('Doctor Profile Updated Successfully:', [
                'doctor_id' => $doctor->id,
                'updated_fields' => array_keys($updateData)
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'data' => $doctor->load('user')
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update doctor profile:', [
                'error' => $e->getMessage(),
                'doctor_id' => $doctor->id,
                'update_data' => $updateData
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload profile image for the authenticated doctor
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

        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor profile not found'
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
            $imageName = 'doctor_' . $doctor->id . '_' . time() . '.' . $image->getClientOriginalExtension();

            // Store in public/storage/doctor_images directory
            $imagePath = $image->storeAs('doctor_images', $imageName, 'public');

            // Get the full URL
            $imageUrl = url('storage/' . $imagePath);

            // Update doctor profile
            $doctor->update(['profile_image' => $imageUrl]);

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
     * Get occupied dates for a specific doctor
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOccupiedDates($id)
    {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor not found'
            ], 404);
        }

        try {
            // Get all confirmed appointments for this doctor
            $occupiedDates = \DB::table('appointments')
                ->where('doctor_id', $id)
                ->where('status', 'confirmed')
                ->whereDate('appointment_datetime', '>=', now()->toDateString())
                ->select(\DB::raw('DATE(appointment_datetime) as date'))
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
     * Get occupied time slots for a specific doctor on a specific date
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOccupiedTimes($id, Request $request)
    {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor not found'
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

            // Get all confirmed appointments for this doctor on the specified date
            $occupiedTimes = \DB::table('appointments')
                ->where('doctor_id', $id)
                ->where('status', 'confirmed')
                ->whereDate('appointment_datetime', $date)
                ->select(\DB::raw('TIME_FORMAT(appointment_datetime, "%h:%i %p") as time'))
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

    /**
     * Remove the specified doctor from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Doctor not found'
            ], 404);
        }

        $doctor->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Doctor deleted successfully'
        ]);
    }
}
