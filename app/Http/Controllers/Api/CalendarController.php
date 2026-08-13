<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;

class CalendarController extends Controller
{
    public function events(Request $request)
    {
        $user = $request->user();
        
        $projects = collect();
        $tasks = collect();

        if ($user->role === 'admin') {
            $projects = Project::all();
            $tasks = Task::all();
        } elseif ($user->role === 'project_manager') {
            $projects = Project::where('project_manager_id', $user->id)->get();
            $projectIds = $projects->pluck('id');
            $tasks = Task::whereIn('project_id', $projectIds)->get();
        } elseif ($user->role === 'team_member') {
            $tasks = Task::where('assigned_to', $user->id)->get();
            $projectIds = $tasks->pluck('project_id')->unique();
            $projects = Project::whereIn('id', $projectIds)->get();
        }

        $events = [];

        foreach ($projects as $project) {
            $events[] = [
                'id' => 'project-' . $project->id,
                'type' => 'project',
                'title' => $project->name,
                'start' => $project->start_date,
                'end' => $project->end_date,
                'priority' => $project->priority,
                'status' => $project->status
            ];
        }

        foreach ($tasks as $task) {
            $events[] = [
                'id' => 'task-' . $task->id,
                'type' => 'task',
                'title' => $task->title,
                'start' => $task->due_date,
                'end' => $task->due_date,
                'priority' => $task->priority,
                'status' => $task->status,
                'project_id' => $task->project_id
            ];
        }

        return response()->json(['events' => $events], 200);
    }
}
