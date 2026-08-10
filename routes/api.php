<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ProjectController;
use App\Http\Controllers\Api\Manager\TaskController;
use App\Http\Controllers\Api\Member\TaskController as MemberTaskController;
use App\Http\Controllers\Api\TaskCommentController;
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

        // Admin-only routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::apiResource('projects', ProjectController::class);
            Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
            Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);
        });

        // Project Manager-only routes
        Route::middleware('role:project_manager')->prefix('manager')->group(function () {
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