<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserType;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Register a new user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone_number' => 'nullable|string|max:20',
            'user_type' => 'required|string|in:patient,doctor,nursing,laboratory,pharmacy',
            'license_number' => 'required_if:user_type,doctor,nursing,laboratory,pharmacy|string|max:50|nullable',
            'national_id' => 'required_if:user_type,doctor,nursing,pharmacy|string|max:20|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            // Get user type ID
            $userType = UserType::where('name', $request->user_type)->first();

            if (!$userType) {
                return response()->json(['message' => 'Invalid user type selected'], 422);
            }

            // Create the user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone_number' => $request->phone_number,
                'user_type_id' => $userType->id,
                'license_number' => $request->license_number,
                'national_id' => $request->user_type !== 'laboratory' ? $request->national_id : null,
            ]);

            // Create user profile
            UserProfile::create([
                'user_id' => $user->id,
            ]);

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type_id' => $user->user_type_id,
                    'user_type' => [
                        'id' => $userType->id,
                        'name' => $userType->name,
                        'display_name' => $userType->display_name,
                    ],
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Registration failed. ' . $e->getMessage()], 500);
        }
    }

    /**
     * Login user and create token
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Attempt login
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid login credentials'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // Check if user is active
        if (!$user->is_active) {
            return response()->json(['message' => 'Your account has been deactivated. Please contact support.'], 403);
        }

        // Load user type
        $userType = UserType::find($user->user_type_id);

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type_id' => $user->user_type_id,
                'user_type' => [
                    'id' => $userType->id,
                    'name' => $userType->name,
                    'display_name' => $userType->display_name,
                ],
            ],
        ]);
    }

    /**
     * Logout user (Revoke the token)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        auth()->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    /**
     * Get the authenticated User
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $userType = UserType::find($user->user_type_id);
        $profile = UserProfile::where('user_id', $user->id)->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'user_type' => $userType->name,
                'profile' => $profile,
            ],
        ]);
    }
}
