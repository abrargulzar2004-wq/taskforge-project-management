<?php
use Illuminate\Support\Facades\Route;
use App\Models\Project;

// TEMPORARY - remove after checking/seeding
Route::get('/check-projects', function () {
    $count = Project::count();
    $projects = Project::all();
    return response()->json([
        'count' => $count,
        'projects' => $projects,
    ]);
});

Route::get('/{any}', function () {
    return file_get_contents(public_path('build/index.html'));
})->where('any', '^(?!api|build).*$');