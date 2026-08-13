<!DOCTYPE html>
<html>
<head>
    <title>Projects Export</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Projects Export</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Manager</th>
                <th>Created By</th>
                <th>Start Date</th>
                <th>End Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projects as $project)
            <tr>
                <td>{{ $project->id }}</td>
                <td>{{ $project->project_code }}</td>
                <td>{{ $project->name }}</td>
                <td>{{ $project->status }}</td>
                <td>{{ $project->priority }}</td>
                <td>{{ $project->manager ? $project->manager->name : '' }}</td>
                <td>{{ $project->creator ? $project->creator->name : '' }}</td>
                <td>{{ $project->start_date }}</td>
                <td>{{ $project->end_date }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
