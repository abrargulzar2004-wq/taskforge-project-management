<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $projectIds = Project::where('project_manager_id', $user->id)->pluck('id');

        $totalTasks = Task::whereIn('project_id', $projectIds)->count();
        $completedTasks = Task::whereIn('project_id', $projectIds)->where('status', 'completed')->count();
        $percentage = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        $projectProgress = Project::where('project_manager_id', $user->id)
            ->get()
            ->map(function ($project) {
                // Determine completion percentage based on tasks
                $pTasks = Task::where('project_id', $project->id)->count();
                $pCompleted = Task::where('project_id', $project->id)->where('status', 'completed')->count();
                $compPerc = $pTasks > 0 ? round(($pCompleted / $pTasks) * 100) : 0;

                return [
                    'project_id' => $project->id,
                    'name' => $project->name,
                    'completion_percentage' => $compPerc
                ];
            });

        // Get team members who belong to any of this manager's projects
        $memberIds = DB::table('project_members')
                       ->whereIn('project_id', $projectIds)
                       ->pluck('user_id')
                       ->unique();

        $members = User::whereIn('id', $memberIds)->where('role', 'team_member')->get();

        $memberPerformance = $members->map(function ($member) use ($projectIds) {
            $assigned = Task::where('assigned_to', $member->id)
                            ->whereIn('project_id', $projectIds)
                            ->count();
            
            $completed = Task::where('assigned_to', $member->id)
                             ->whereIn('project_id', $projectIds)
                             ->where('status', 'completed')
                             ->count();

            return [
                'user_id' => $member->id,
                'name' => $member->name,
                'tasks_completed' => $completed,
                'tasks_assigned' => $assigned
            ];
        })->values();

        return response()->json([
            'task_completion' => [
                'total' => $totalTasks,
                'completed' => $completedTasks,
                'percentage' => $percentage
            ],
            'project_progress' => $projectProgress,
            'member_performance' => $memberPerformance
        ], 200);
    }
}
