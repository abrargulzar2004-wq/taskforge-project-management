<!DOCTYPE html>
<html>
<head>
    <title>Tasks Export</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Tasks Export</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Start Date</th>
                <th>Due Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tasks as $task)
            <tr>
                <td>{{ $task->id }}</td>
                <td>{{ $task->title }}</td>
                <td>{{ $task->project ? $task->project->name : '' }}</td>
                <td>{{ $task->assignee ? $task->assignee->name : 'Unassigned' }}</td>
                <td>{{ $task->status }}</td>
                <td>{{ $task->priority }}</td>
                <td>{{ $task->start_date }}</td>
                <td>{{ $task->due_date }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
