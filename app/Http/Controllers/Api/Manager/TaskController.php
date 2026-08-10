<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * List tasks for a project the manager owns (or all their tasks if no project given).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Task::with(['project', 'assignee', 'creator'])
            ->whereHas('project', function ($q) use ($user) {
                $q->where('project_manager_id', $user->id);
            });

        if ($request->has('project_id') && $request->project_id !== '') {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to') && $request->assigned_to !== '') {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->orderBy('due_date', 'asc')->paginate(15);

        return response()->json($tasks, 200);
    }

    /**
     * Create a new task on a project the manager owns.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,medium,high,critical',
            'status' => 'nullable|in:to_do,in_progress,review,completed,blocked,cancelled',
            'estimated_hours' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'due_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $project = Project::findOrFail($request->project_id);

        if ($project->project_manager_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You do not have permission to add tasks to this project.',
            ], 403);
        }

        $task = Task::create([
            'project_id' => $request->project_id,
            'assigned_to' => $request->assigned_to,
            'created_by' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => $request->status ?? 'to_do',
            'estimated_hours' => $request->estimated_hours,
            'start_date' => $request->start_date,
            'due_date' => $request->due_date,
        ]);

        $project->recalculateProgress();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'created_task',
            'description' => "{$request->user()->name} created task {$task->title} in project {$project->name}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load('project', 'assignee', 'creator'),
        ], 201);
    }

    /**
     * Show a single task.
     */
    public function show(Task $task)
    {
        return response()->json([
            'task' => $task->load('project', 'assignee', 'creator', 'comments.user'),
        ], 200);
    }

    /**
     * Update a task (Manager only, and only their own project's tasks).
     */
    public function update(Request $request, Task $task)
    {
        if ($task->project->project_manager_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You do not have permission to update this task.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'sometimes|required|in:low,medium,high,critical',
            'status' => 'sometimes|required|in:to_do,in_progress,review,completed,blocked,cancelled',
            'estimated_hours' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'due_date' => 'sometimes|required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only([
            'title', 'description', 'assigned_to', 'priority',
            'status', 'estimated_hours', 'start_date', 'due_date',
        ]);

        $data['updated_by'] = $request->user()->id;

        if (isset($data['status']) && $data['status'] === 'completed' && $task->status !== 'completed') {
            $data['completed_at'] = now();
        }

        $task->update($data);
        $task->project->recalculateProgress();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'updated_task',
            'description' => "{$request->user()->name} updated task {$task->title}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task->load('project', 'assignee', 'creator'),
        ], 200);
    }

    /**
     * Delete a task (Manager only, and only their own project's tasks).
     */
    public function destroy(Request $request, Task $task)
    {
        if ($task->project->project_manager_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You do not have permission to delete this task.',
            ], 403);
        }

        $project = $task->project;
        $task->delete();
        $project->recalculateProgress();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'deleted_task',
            'description' => "{$request->user()->name} deleted task {$task->title}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Task deleted successfully',
        ], 200);
    }
}