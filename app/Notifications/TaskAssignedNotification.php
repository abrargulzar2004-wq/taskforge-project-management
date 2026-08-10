<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskAssignedNotification extends Notification
{
    use Queueable;

    protected Task $task;

    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Task Assigned',
            'message' => "You have been assigned a new task: {$this->task->title}",
            'type' => 'task_assigned',
            'task_id' => $this->task->id,
            'project_id' => $this->task->project_id,
        ];
    }
}