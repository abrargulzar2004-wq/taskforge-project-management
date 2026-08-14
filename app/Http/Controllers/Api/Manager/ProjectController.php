<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;

class ProjectController extends Controller
{
    /**
     * List projects that belong to the logged-in manager.
     */
    public function index(Request $request)
    {
        $query = Project::with(['manager', 'creator'])
            ->where('project_manager_id', $request->user()->id);

        if ($request->has('search') && $request->search !== '' && $request->search !== 'undefined' && $request->search !== 'null') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('project_code', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('status') && $request->status !== '' && $request->status !== 'undefined' && $request->status !== 'null') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== '' && $request->priority !== 'undefined' && $request->priority !== 'null') {
            $query->where('priority', $request->priority);
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($projects, 200);
    }

    /**
     * Show a single project (with team members) that belongs to the logged-in manager.
     */
    public function show(Request $request, Project $project)
    {
        if ($project->project_manager_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You do not have permission to view this project.',
            ], 403);
        }

        return response()->json([
            'project' => $project->load(['manager', 'creator', 'members']),
        ], 200);
    }
}