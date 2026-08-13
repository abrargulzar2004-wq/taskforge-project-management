<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function projects(Request $request)
    {
        $query = Project::query();

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $totalProjects = $query->count();
        $completedProjects = (clone $query)->where('status', 'completed')->count();
        $percentage = $totalProjects > 0 ? round(($completedProjects / $totalProjects) * 100) : 0;

        $byStatus = (clone $query)->select('status', DB::raw('count(*) as total'))
                                  ->groupBy('status')
                                  ->pluck('total', 'status')
                                  ->toArray();
        $byStatus = array_merge(['planning' => 0, 'active' => 0, 'on_hold' => 0, 'completed' => 0, 'cancelled' => 0], $byStatus);

        // Group by month for the last 6 months minimum
        $byMonthRaw = (clone $query)
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->pluck('count', 'month')
            ->toArray();

        $byMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $byMonth[] = [
                'month' => $month,
                'count' => $byMonthRaw[$month] ?? 0
            ];
        }

        return response()->json([
            'completion_rate' => [
                'total_projects' => $totalProjects,
                'completed_projects' => $completedProjects,
                'percentage' => $percentage
            ],
            'by_status' => $byStatus,
            'by_month' => $byMonth
        ], 200);
    }

    public function tasks(Request $request)
    {
        $query = Task::query();

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $totalTasks = $query->count();
        $completed = (clone $query)->where('status', 'completed')->count();
        $pending = (clone $query)->whereNotIn('status', ['completed', 'cancelled'])->count();
        $overdue = (clone $query)->where('due_date', '<', now())
                                 ->whereNotIn('status', ['completed', 'cancelled'])
                                 ->count();

        $byPriority = (clone $query)->select('priority', DB::raw('count(*) as total'))
                                    ->groupBy('priority')
                                    ->pluck('total', 'priority')
                                    ->toArray();
        $byPriority = array_merge(['low' => 0, 'medium' => 0, 'high' => 0, 'critical' => 0], $byPriority);

        $projectsData = (clone $query)->with('project')
                                      ->select('project_id', DB::raw('count(*) as total_tasks'), DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_tasks'))
                                      ->groupBy('project_id')
                                      ->get()
                                      ->map(function ($item) {
                                          return [
                                              'project_id' => $item->project_id,
                                              'project_name' => $item->project->name ?? 'Unknown',
                                              'total_tasks' => (int) $item->total_tasks,
                                              'completed_tasks' => (int) $item->completed_tasks
                                          ];
                                      });

        return response()->json([
            'completion_stats' => [
                'total_tasks' => $totalTasks,
                'completed' => $completed,
                'pending' => $pending,
                'overdue' => $overdue
            ],
            'by_priority' => $byPriority,
            'by_project' => $projectsData
        ], 200);
    }

    public function overdue(Request $request)
    {
        $sort = $request->query('sort', 'days_overdue');

        $query = Task::with(['project', 'assignee'])
                     ->where('due_date', '<', now())
                     ->whereNotIn('status', ['completed', 'cancelled']);

        if ($sort === 'due_date') {
            $query->orderBy('due_date', 'asc');
        } else {
            // Raw order by datediff to ensure db-level sort handles pagination
            $query->orderByRaw('DATEDIFF(NOW(), due_date) DESC');
        }

        $paginator = $query->paginate(15);

        $paginator->getCollection()->transform(function ($task) {
            $days_overdue = Carbon::parse($task->due_date)->diffInDays(now(), false);
            return [
                'id' => $task->id,
                'title' => $task->title,
                'due_date' => $task->due_date,
                'days_overdue' => (int) max(0, $days_overdue),
                'priority' => $task->priority,
                'project' => $task->project ? ['id' => $task->project->id, 'name' => $task->project->name] : null,
                'assignee' => $task->assignee ? ['id' => $task->assignee->id, 'name' => $task->assignee->name] : null
            ];
        });

        return response()->json($paginator, 200);
    }

    public function productivity(Request $request)
    {
        $startDate = $request->input('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $teamMembers = User::where('role', 'team_member')->get();

        $productivity = $teamMembers->map(function ($member) use ($startDate, $endDate) {
            $tasksCompleted = Task::where('assigned_to', $member->id)
                                  ->where('status', 'completed')
                                  ->whereNotNull('completed_at')
                                  ->whereDate('completed_at', '>=', $startDate)
                                  ->whereDate('completed_at', '<=', $endDate)
                                  ->count();
            return [
                'user_id' => $member->id,
                'name' => $member->name,
                'tasks_completed' => $tasksCompleted
            ];
        });

        return response()->json([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'productivity' => $productivity
        ], 200);
    }
}
