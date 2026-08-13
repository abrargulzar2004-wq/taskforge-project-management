<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function admin(Request $request)
    {
        $usersCount = User::count();
        $managersCount = User::where('role', 'project_manager')->count();
        $membersCount = User::where('role', 'team_member')->count();

        $projectsCount = Project::count();
        $activeProjects = Project::where('status', 'active')->count();
        $completedProjects = Project::where('status', 'completed')->count();

        $pendingTasks = Task::whereNotIn('status', ['completed', 'cancelled'])->count();
        $completedTasks = Task::where('status', 'completed')->count();
        $overdueTasks = Task::where('due_date', '<', now())
                            ->whereNotIn('status', ['completed', 'cancelled'])
                            ->count();

        $projectsByStatus = Project::select('status', DB::raw('count(*) as total'))
                                   ->groupBy('status')
                                   ->pluck('total', 'status')
                                   ->toArray();

        $tasksByStatus = Task::select('status', DB::raw('count(*) as total'))
                             ->groupBy('status')
                             ->pluck('total', 'status')
                             ->toArray();

        $tasksByPriority = Task::select('priority', DB::raw('count(*) as total'))
                               ->groupBy('priority')
                               ->pluck('total', 'priority')
                               ->toArray();

        // Ensure defaults if a status/priority has 0
        $projectsByStatus = array_merge(['planning' => 0, 'active' => 0, 'on_hold' => 0, 'completed' => 0, 'cancelled' => 0], $projectsByStatus);
        $tasksByStatus = array_merge(['to_do' => 0, 'in_progress' => 0, 'review' => 0, 'completed' => 0, 'blocked' => 0, 'cancelled' => 0], $tasksByStatus);
        $tasksByPriority = array_merge(['low' => 0, 'medium' => 0, 'high' => 0, 'critical' => 0], $tasksByPriority);

        $recentActivity = ActivityLog::with('user')->latest()->take(10)->get();
        $recentUsers = User::latest()->take(5)->get();

        return response()->json([
            'cards' => [
                'total_users' => $usersCount,
                'total_managers' => $managersCount,
                'total_members' => $membersCount,
                'total_projects' => $projectsCount,
                'active_projects' => $activeProjects,
                'completed_projects' => $completedProjects,
                'pending_tasks' => $pendingTasks,
                'completed_tasks' => $completedTasks,
                'overdue_tasks' => $overdueTasks
            ],
            'charts' => [
                'projects_by_status' => $projectsByStatus,
                'tasks_by_status' => $tasksByStatus,
                'tasks_by_priority' => $tasksByPriority
            ],
            'recent_activity' => $recentActivity,
            'recent_users' => $recentUsers
        ], 200);
    }

    public function manager(Request $request)
    {
        $user = $request->user();
        
        $assignedProjectsQuery = Project::where('project_manager_id', $user->id);
        $assignedProjectsCount = $assignedProjectsQuery->count();
        $projectIds = $assignedProjectsQuery->pluck('id');

        $myTeamCount = DB::table('project_members')
                         ->whereIn('project_id', $projectIds)
                         ->distinct('user_id')
                         ->count('user_id');

        $openTasks = Task::whereIn('project_id', $projectIds)
                         ->whereNotIn('status', ['completed', 'cancelled'])
                         ->count();

        $completedTasks = Task::whereIn('project_id', $projectIds)
                              ->where('status', 'completed')
                              ->count();

        $pendingReviews = Task::whereIn('project_id', $projectIds)
                              ->where('status', 'review')
                              ->count();

        $upcomingDeadlines = Task::whereIn('project_id', $projectIds)
                                 ->whereNotIn('status', ['completed', 'cancelled'])
                                 ->whereBetween('due_date', [now(), now()->addDays(7)])
                                 ->count();

        $recentActivity = ActivityLog::with('user')
                                     ->where(function ($query) use ($projectIds) {
                                         $query->where(function ($q) use ($projectIds) {
                                             $q->where('subject_type', Project::class)
                                               ->whereIn('subject_id', $projectIds);
                                         })->orWhere(function ($q) use ($projectIds) {
                                             $q->where('subject_type', Task::class)
                                               ->whereIn('subject_id', Task::whereIn('project_id', $projectIds)->pluck('id'));
                                         });
                                     })
                                     ->latest()
                                     ->take(10)
                                     ->get();

        // For charts, return empty objects or basic aggregations as implied by spec
        return response()->json([
            'cards' => [
                'assigned_projects' => $assignedProjectsCount,
                'my_team' => $myTeamCount,
                'open_tasks' => $openTasks,
                'completed_tasks' => $completedTasks,
                'pending_reviews' => $pendingReviews,
                'upcoming_deadlines' => $upcomingDeadlines
            ],
            'charts' => [
                'task_progress' => (object)[],
                'project_progress' => (object)[]
            ],
            'recent_activity' => $recentActivity
        ], 200);
    }

    public function member(Request $request)
    {
        $user = $request->user();

        $assignedTasks = Task::where('assigned_to', $user->id)->count();
        $completedTasks = Task::where('assigned_to', $user->id)->where('status', 'completed')->count();
        $pendingTasks = Task::where('assigned_to', $user->id)->whereNotIn('status', ['completed', 'cancelled'])->count();
        
        $todaysTasks = Task::where('assigned_to', $user->id)
                           ->whereDate('due_date', now()->toDateString())
                           ->count();

        $upcomingDeadlines = Task::where('assigned_to', $user->id)
                                 ->whereNotIn('status', ['completed', 'cancelled'])
                                 ->whereBetween('due_date', [now(), now()->addDays(7)])
                                 ->count();

        $recentNotifications = $user->notifications()->latest()->take(5)->get();

        return response()->json([
            'cards' => [
                'assigned_tasks' => $assignedTasks,
                'completed_tasks' => $completedTasks,
                'pending_tasks' => $pendingTasks,
                'todays_tasks' => $todaysTasks,
                'upcoming_deadlines' => $upcomingDeadlines
            ],
            'recent_notifications' => $recentNotifications
        ], 200);
    }
}
