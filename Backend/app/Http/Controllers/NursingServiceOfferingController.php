<?php

namespace App\Http\Controllers;

use App\Models\NursingServiceOffering;
use App\Models\NursingProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class NursingServiceOfferingController extends Controller
{
    /**
     * Display a listing of the nursing service offerings for the current provider.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        // Get the nursing provider for the current user
        $nursingProvider = NursingProvider::where('user_id', $user->id)->first();

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider profile not found'
            ], 404);
        }

        // Get service offerings for this provider
        $serviceOfferings = NursingServiceOffering::where('nursing_provider_id', $nursingProvider->id)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $serviceOfferings
        ]);
    }

    /**
     * Store a newly created nursing service offering in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        // Get the nursing provider for the current user
        $nursingProvider = NursingProvider::where('user_id', $user->id)->first();

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'availability' => 'required|string|max:255',
            'experience' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $serviceOffering = NursingServiceOffering::create([
            'nursing_provider_id' => $nursingProvider->id,
            'name' => $request->name,
            'description' => $request->description,
            'location' => $request->location,
            'availability' => $request->availability,
            'experience' => $request->experience,
            'price' => $request->price,
            'is_active' => true,
        ]);

        // Load with nursing provider relationship
        $serviceOffering = $serviceOffering->load('nursingProvider.user');

        return response()->json([
            'status' => 'success',
            'message' => 'Service offering created successfully',
            'data' => $serviceOffering
        ], 201);
    }

    /**
     * Display the specified nursing service offering.
     */
    public function show(string $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $serviceOffering = NursingServiceOffering::with('nursingProvider.user')->find($id);

        if (!$serviceOffering) {
            return response()->json([
                'status' => 'error',
                'message' => 'Service offering not found'
            ], 404);
        }

        // Check if the service offering belongs to the current user's nursing provider
        $nursingProvider = NursingProvider::where('user_id', $user->id)->first();
        if (!$nursingProvider || $serviceOffering->nursing_provider_id !== $nursingProvider->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to this service offering'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $serviceOffering
        ]);
    }

    /**
     * Update the specified nursing service offering in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $serviceOffering = NursingServiceOffering::find($id);

        if (!$serviceOffering) {
            return response()->json([
                'status' => 'error',
                'message' => 'Service offering not found'
            ], 404);
        }

        // Check if the service offering belongs to the current user's nursing provider
        $nursingProvider = NursingProvider::where('user_id', $user->id)->first();
        if (!$nursingProvider || $serviceOffering->nursing_provider_id !== $nursingProvider->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to this service offering'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'string',
            'location' => 'string|max:255',
            'availability' => 'string|max:255',
            'experience' => 'string|max:255',
            'price' => 'numeric|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $serviceOffering->update($request->only([
            'name', 'description', 'location', 'availability', 'experience', 'price', 'is_active'
        ]));

        // Load with nursing provider relationship
        $serviceOffering = $serviceOffering->load('nursingProvider.user');

        return response()->json([
            'status' => 'success',
            'message' => 'Service offering updated successfully',
            'data' => $serviceOffering
        ]);
    }

    /**
     * Remove the specified nursing service offering from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $serviceOffering = NursingServiceOffering::find($id);

        if (!$serviceOffering) {
            return response()->json([
                'status' => 'error',
                'message' => 'Service offering not found'
            ], 404);
        }

        // Check if the service offering belongs to the current user's nursing provider
        $nursingProvider = NursingProvider::where('user_id', $user->id)->first();
        if (!$nursingProvider || $serviceOffering->nursing_provider_id !== $nursingProvider->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to this service offering'
            ], 403);
        }

        $serviceOffering->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Service offering deleted successfully'
        ]);
    }

    /**
     * Display a listing of all active nursing service offerings (public access).
     */
    public function publicIndex()
    {
        $serviceOfferings = NursingServiceOffering::with('nursingProvider.user')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $serviceOfferings
        ]);
    }

    /**
     * Get service offerings for a specific provider (public access).
     */
    public function getByProvider($providerId)
    {
        $nursingProvider = NursingProvider::find($providerId);

        if (!$nursingProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing provider not found'
            ], 404);
        }

        $serviceOfferings = NursingServiceOffering::where('nursing_provider_id', $providerId)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $serviceOfferings
        ]);
    }
}
