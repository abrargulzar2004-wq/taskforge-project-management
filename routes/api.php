<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ProjectController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes (no login required)
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes (must be logged in with a valid token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Admin-only routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::apiResource('projects', ProjectController::class);
            Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
            Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);
        });
    });

});