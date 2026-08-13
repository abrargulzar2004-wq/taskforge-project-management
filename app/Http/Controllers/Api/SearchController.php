<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $term = $request->q;
        $user = $request->user();

        $projects = collect();
        $tasks = collect();
        $users = collect();

        if ($user->role === 'admin') {
            $projects = Project::where('name', 'LIKE', '%' . $term . '%')
                               ->orWhere('project_code', 'LIKE', '%' . $term . '%')
                               ->take(5)
                               ->get();

            $tasks = Task::where('title', 'LIKE', '%' . $term . '%')
                         ->take(5)
                         ->get();

            $users = User::where('name', 'LIKE', '%' . $term . '%')
                         ->orWhere('email', 'LIKE', '%' . $term . '%')
                         ->take(5)
                         ->get();
        } elseif ($user->role === 'project_manager') {
            $projects = Project::where('project_manager_id', $user->id)
                               ->where(function ($query) use ($term) {
                                   $query->where('name', 'LIKE', '%' . $term . '%')
                                         ->orWhere('project_code', 'LIKE', '%' . $term . '%');
                               })
                               ->take(5)
                               ->get();

            $projectIds = Project::where('project_manager_id', $user->id)->pluck('id');
            $tasks = Task::whereIn('project_id', $projectIds)
                         ->where('title', 'LIKE', '%' . $term . '%')
                         ->take(5)
                         ->get();
        } elseif ($user->role === 'team_member') {
            $tasks = Task::where('assigned_to', $user->id)
                         ->where('title', 'LIKE', '%' . $term . '%')
                         ->take(5)
                         ->get();

            $projectIds = Task::where('assigned_to', $user->id)->pluck('project_id')->unique();
            $projects = Project::whereIn('id', $projectIds)
                               ->where(function ($query) use ($term) {
                                   $query->where('name', 'LIKE', '%' . $term . '%')
                                         ->orWhere('project_code', 'LIKE', '%' . $term . '%');
                               })
                               ->take(5)
                               ->get();
        }

        // The exact shape requires: projects, tasks, users array
        return response()->json([
            'projects' => $projects->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'project_code' => $p->project_code,
                    'status' => $p->status
                ];
            }),
            'tasks' => $tasks->map(function ($t) {
                return [
                    'id' => $t->id,
                    'title' => $t->title,
                    'status' => $t->status,
                    'project_id' => $t->project_id
                ];
            }),
            'users' => $users
        ], 200);
    }
}
