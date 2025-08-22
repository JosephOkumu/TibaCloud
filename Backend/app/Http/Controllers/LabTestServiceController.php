<?php

namespace App\Http\Controllers;

use App\Models\LabTestService;
use App\Models\LabProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LabTestServiceController extends Controller
{
    /**
     * Display a listing of lab test services for the authenticated lab provider.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
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

        $query = LabTestService::where('lab_provider_id', $labProvider->id);

        // Add search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Add filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $testServices = $query->orderBy('sort_order')->orderBy('test_name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $testServices
        ]);
    }

    /**
     * Store a newly created test service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
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
            'test_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'turnaround_time' => 'nullable|string|max:100',
            'sample_type' => 'nullable|string|max:100',
            'preparation_instructions' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if test name already exists for this lab provider
        $existingTest = LabTestService::where('lab_provider_id', $labProvider->id)
            ->where('test_name', $request->test_name)
            ->first();

        if ($existingTest) {
            return response()->json([
                'status' => 'error',
                'message' => 'A test with this name already exists for your laboratory'
            ], 422);
        }

        try {
            $testService = LabTestService::create([
                'lab_provider_id' => $labProvider->id,
                'test_name' => $request->test_name,
                'description' => $request->description,
                'price' => $request->price,
                'turnaround_time' => $request->turnaround_time,
                'sample_type' => $request->sample_type,
                'preparation_instructions' => $request->preparation_instructions,
                'is_active' => $request->is_active ?? true,
                'sort_order' => $request->sort_order ?? 0,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Test service created successfully',
                'data' => $testService
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create test service: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified test service.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
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

        $testService = LabTestService::where('id', $id)
            ->where('lab_provider_id', $labProvider->id)
            ->first();

        if (!$testService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Test service not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $testService
        ]);
    }

    /**
     * Update the specified test service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
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

        $testService = LabTestService::where('id', $id)
            ->where('lab_provider_id', $labProvider->id)
            ->first();

        if (!$testService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Test service not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'test_name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'turnaround_time' => 'nullable|string|max:100',
            'sample_type' => 'nullable|string|max:100',
            'preparation_instructions' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if test name already exists for this lab provider (excluding current test)
        if ($request->has('test_name')) {
            $existingTest = LabTestService::where('lab_provider_id', $labProvider->id)
                ->where('test_name', $request->test_name)
                ->where('id', '!=', $id)
                ->first();

            if ($existingTest) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'A test with this name already exists for your laboratory'
                ], 422);
            }
        }

        try {
            $updateData = $request->only([
                'test_name',
                'description',
                'price',
                'turnaround_time',
                'sample_type',
                'preparation_instructions',
                'is_active',
                'sort_order'
            ]);

            $testService->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Test service updated successfully',
                'data' => $testService->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update test service: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified test service from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
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

        $testService = LabTestService::where('id', $id)
            ->where('lab_provider_id', $labProvider->id)
            ->first();

        if (!$testService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Test service not found'
            ], 404);
        }

        try {
            $testService->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Test service deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete test service: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle the active status of a test service.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleStatus($id)
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

        $testService = LabTestService::where('id', $id)
            ->where('lab_provider_id', $labProvider->id)
            ->first();

        if (!$testService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Test service not found'
            ], 404);
        }

        try {
            $testService->update(['is_active' => !$testService->is_active]);

            return response()->json([
                'status' => 'success',
                'message' => 'Test service status updated successfully',
                'data' => $testService->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update test service status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all test services for a specific lab provider (public endpoint).
     *
     * @param  int  $labProviderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByLabProvider($labProviderId)
    {
        $labProvider = LabProvider::find($labProviderId);

        if (!$labProvider) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab provider not found'
            ], 404);
        }

        $testServices = LabTestService::where('lab_provider_id', $labProviderId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('test_name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $testServices,
            'lab_provider' => $labProvider->only(['id', 'lab_name', 'address'])
        ]);
    }
}
