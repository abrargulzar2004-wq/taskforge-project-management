<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * List all users, with search + filter + pagination.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('role') && $request->role !== '') {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($users, 200);
    }

    /**
     * Create a new user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,project_manager,team_member',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'address' => $request->address,
            'status' => 'active',
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'action' => 'created_user',
            'description' => "{$request->user()->name} created user {$user->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Show a single user.
     */
    public function show(User $user)
    {
        return response()->json(['user' => $user], 200);
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|min:3|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|required|in:admin,project_manager,team_member',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only(['name', 'email', 'role', 'phone', 'address', 'status']));

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'action' => 'updated_user',
            'description' => "{$request->user()->name} updated user {$user->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ], 200);
    }

    /**
     * Soft delete a user.
     */
    public function destroy(Request $request, User $user)
    {
        $user->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'action' => 'deleted_user',
            'description' => "{$request->user()->name} deleted user {$user->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'User deleted successfully',
        ], 200);
    }
}