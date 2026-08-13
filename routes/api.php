<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ProjectController;
use App\Http\Controllers\Api\Manager\TaskController;
use App\Http\Controllers\Api\Member\TaskController as MemberTaskController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Manager\ReportController as ManagerReportController;
use App\Http\Controllers\Api\Manager\ProjectController as ManagerProjectController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes (no login required)
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes (must be logged in with a valid token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Task Discussion - shared across all roles, permission handled inside the controller
        Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
        Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
        Route::delete('/comments/{comment}', [TaskCommentController::class, 'destroy']);

        // Phase 9 Shared Routes
        Route::get('/calendar/events', [CalendarController::class, 'events']);
        Route::get('/search', [SearchController::class, 'index']);

        // Phase 11 Shared Routes (Notifications & Profile)
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
        
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword']);

        // Phase 9 Dashboard Routes (Role specific, un-prefixed)
        Route::middleware('role:admin')->get('/dashboard/admin', [DashboardController::class, 'admin']);
        Route::middleware('role:project_manager')->get('/dashboard/manager', [DashboardController::class, 'manager']);
        Route::middleware('role:team_member')->get('/dashboard/member', [DashboardController::class, 'member']);

        // Admin Reports (Role specific, un-prefixed)
        Route::middleware('role:admin')->group(function () {
            Route::get('/reports/projects', [AdminReportController::class, 'projects']);
            Route::get('/reports/tasks', [AdminReportController::class, 'tasks']);
            Route::get('/reports/overdue', [AdminReportController::class, 'overdue']);
            Route::get('/reports/productivity', [AdminReportController::class, 'productivity']);
        });

        // Admin-only routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/users/export', [UserController::class, 'export']);
            Route::get('/projects/export', [ProjectController::class, 'export']);
            Route::apiResource('users', UserController::class);
            Route::apiResource('projects', ProjectController::class);
            Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
            Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);
        });

        // Project Manager-only routes
        Route::middleware('role:project_manager')->prefix('manager')->group(function () {
            Route::get('/reports', [ManagerReportController::class, 'index']);
            Route::get('/projects', [ManagerProjectController::class, 'index']);
            Route::get('/tasks/export', [TaskController::class, 'export']);
            Route::apiResource('tasks', TaskController::class);
        });

        // Team Member-only routes
        Route::middleware('role:team_member')->prefix('member')->group(function () {
            Route::get('/tasks', [MemberTaskController::class, 'index']);
            Route::get('/tasks/{task}', [MemberTaskController::class, 'show']);
            Route::patch('/tasks/{task}/status', [MemberTaskController::class, 'updateStatus']);
        });
    });

});