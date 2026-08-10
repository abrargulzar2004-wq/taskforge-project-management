<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    /**
     * List all projects, with search + filter + pagination.
     */
    public function index(Request $request)
    {
        $query = Project::with(['manager', 'creator']);

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('project_code', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('manager_id') && $request->manager_id !== '') {
            $query->where('project_manager_id', $request->manager_id);
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($projects, 200);
    }

    /**
     * Create a new project.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,critical',
            'status' => 'nullable|in:planning,active,on_hold,completed,cancelled',
            'budget' => 'nullable|numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'project_manager_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $manager = User::find($request->project_manager_id);
        if ($manager->role !== 'project_manager') {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => ['project_manager_id' => ['The selected user is not a Project Manager.']],
            ], 422);
        }

        $projectCode = 'PRJ-' . str_pad((Project::withTrashed()->count() + 1), 3, '0', STR_PAD_LEFT);

        $project = Project::create([
            'project_code' => $projectCode,
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'priority' => $request->priority,
            'status' => $request->status ?? 'planning',
            'budget' => $request->budget,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'project_manager_id' => $request->project_manager_id,
            'created_by' => $request->user()->id,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Project::class,
            'subject_id' => $project->id,
            'action' => 'created_project',
            'description' => "{$request->user()->name} created project {$project->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project->load('manager', 'creator'),
        ], 201);
    }

    /**
     * Show a single project with its members and tasks.
     */
    public function show(Project $project)
    {
        return response()->json([
            'project' => $project->load('manager', 'creator', 'members', 'tasks'),
        ], 200);
    }

    /**
     * Update an existing project.
     */
    public function update(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'nullable|string',
            'priority' => 'sometimes|required|in:low,medium,high,critical',
            'status' => 'sometimes|required|in:planning,active,on_hold,completed,cancelled',
            'budget' => 'nullable|numeric',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'project_manager_id' => 'sometimes|required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $project->update($request->only([
            'name', 'description', 'category', 'priority', 'status',
            'budget', 'start_date', 'end_date', 'project_manager_id',
        ]));

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Project::class,
            'subject_id' => $project->id,
            'action' => 'updated_project',
            'description' => "{$request->user()->name} updated project {$project->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->load('manager', 'creator'),
        ], 200);
    }

    /**
     * Soft delete a project.
     */
    public function destroy(Request $request, Project $project)
    {
        $project->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Project::class,
            'subject_id' => $project->id,
            'action' => 'deleted_project',
            'description' => "{$request->user()->name} deleted project {$project->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Project deleted successfully',
        ], 200);
    }

    /**
     * Add a team member to a project.
     */
    public function addMember(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($project->members()->where('user_id', $request->user_id)->exists()) {
            return response()->json([
                'message' => 'This user is already a member of the project.',
            ], 422);
        }

        $project->members()->attach($request->user_id);

        $member = User::find($request->user_id);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Project::class,
            'subject_id' => $project->id,
            'action' => 'assigned_member',
            'description' => "{$request->user()->name} added {$member->name} to project {$project->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Member added successfully',
            'project' => $project->load('members'),
        ], 200);
    }

    /**
     * Remove a team member from a project.
     */
    public function removeMember(Request $request, Project $project, User $user)
    {
        $project->members()->detach($user->id);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Project::class,
            'subject_id' => $project->id,
            'action' => 'removed_member',
            'description' => "{$request->user()->name} removed {$user->name} from project {$project->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Member removed successfully',
        ], 200);
    }
}