<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * List the logged-in Team Member's own assigned tasks.
     */
    public function index(Request $request)
    {
        $query = Task::with(['project', 'creator'])
            ->where('assigned_to', $request->user()->id);

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->orderBy('due_date', 'asc')->paginate(15);

        return response()->json($tasks, 200);
    }

    /**
     * Show a single task the member is assigned to.
     */
    public function show(Request $request, Task $task)
    {
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json([
                'message' => 'You do not have permission to view this task.',
            ], 403);
        }

        return response()->json([
            'task' => $task->load('project', 'creator', 'comments.user'),
        ], 200);
    }

    /**
     * Update the status of the member's own task (status only, nothing else).
     */
    public function updateStatus(Request $request, Task $task)
    {
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json([
                'message' => 'You do not have permission to update this task.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:to_do,in_progress,review,completed,blocked',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = ['status' => $request->status, 'updated_by' => $request->user()->id];

        if ($request->status === 'completed' && $task->status !== 'completed') {
            $data['completed_at'] = now();
        }

        $task->update($data);
        $task->project->recalculateProgress();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'status_changed',
            'description' => "{$request->user()->name} changed status of task {$task->title} to {$request->status}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Task status updated successfully',
            'task' => $task->load('project', 'creator'),
        ], 200);
    }
}