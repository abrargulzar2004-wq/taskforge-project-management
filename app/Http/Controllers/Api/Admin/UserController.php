<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    /**
     * List all users, with search + filter + pagination.
     */
    private function buildFilterQuery(Request $request)
    {
        $query = User::query();

        if ($request->has('search') && $request->search !== '' && $request->search !== 'undefined' && $request->search !== 'null') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('role') && $request->role !== '' && $request->role !== 'undefined' && $request->role !== 'null') {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && $request->status !== '' && $request->status !== 'undefined' && $request->status !== 'null') {
            $query->where('status', $request->status);
        }

        return $query;
    }

    /**
     * List all users, with search + filter + pagination.
     */
    public function index(Request $request)
    {
        $query = $this->buildFilterQuery($request);
        $users = $query->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($users, 200);
    }

    /**
     * Export users as CSV or PDF.
     */
    public function export(Request $request)
    {
        if (!$request->has('format') || !in_array($request->format, ['csv', 'pdf'])) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => ['format' => ['The format parameter is required and must be either csv or pdf.']]
            ], 422);
        }

        $query = $this->buildFilterQuery($request);
        $users = $query->orderBy('created_at', 'desc')->get();

        if ($request->format === 'csv') {
            $response = new StreamedResponse(function() use ($users) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At']);
                
                foreach ($users as $user) {
                    fputcsv($handle, [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->role,
                        $user->status,
                        $user->created_at->toDateTimeString()
                    ]);
                }
                
                fclose($handle);
            });

            $response->headers->set('Content-Type', 'text/csv');
            $response->headers->set('Content-Disposition', 'attachment; filename="users_export.csv"');

            return $response;
        }

        // PDF Format
        $pdf = Pdf::loadView('exports.users-pdf', ['users' => $users]);
        return $pdf->download('users_export.pdf');
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