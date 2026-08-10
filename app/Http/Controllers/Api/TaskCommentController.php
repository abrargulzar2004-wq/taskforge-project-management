<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskCommentController extends Controller
{
    /**
     * List all comments for a task the user is allowed to see.
     */
    public function index(Request $request, Task $task)
    {
        if (! $this->canAccessTask($request, $task)) {
            return response()->json([
                'message' => 'You do not have permission to view this task.',
            ], 403);
        }

        $comments = $task->comments()->with('user')->orderBy('created_at', 'asc')->get();

        return response()->json(['comments' => $comments], 200);
    }

    /**
     * Add a comment to a task.
     */
    public function store(Request $request, Task $task)
    {
        if (! $this->canAccessTask($request, $task)) {
            return response()->json([
                'message' => 'You do not have permission to comment on this task.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|min:2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'subject_type' => Task::class,
            'subject_id' => $task->id,
            'action' => 'comment_added',
            'description' => "{$request->user()->name} commented on task {$task->title}",
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment->load('user'),
        ], 201);
    }

    /**
     * Delete a comment (only its own author, or an Admin, can delete it).
     */
    public function destroy(Request $request, TaskComment $comment)
    {
        $user = $request->user();

        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'message' => 'You do not have permission to delete this comment.',
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ], 200);
    }

    /**
     * Shared permission check: Admin sees everything, Manager sees their own
     * projects' tasks, Team Member sees only their own assigned tasks.
     */
    private function canAccessTask(Request $request, Task $task): bool
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'project_manager') {
            return $task->project->project_manager_id === $user->id;
        }

        if ($user->role === 'team_member') {
            return $task->assigned_to === $user->id;
        }

        return false;
    }
}