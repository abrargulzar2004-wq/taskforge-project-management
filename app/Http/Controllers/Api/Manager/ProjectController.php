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

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('project_code', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($projects, 200);
    }
}
