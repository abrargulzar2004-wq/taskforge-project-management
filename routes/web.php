<?php
use Illuminate\Support\Facades\Route;

Route::get('/temp-reset-member-password-xk29', function () {
    $user = \App\Models\User::where('email', 'member@test.com')->first();

    if (!$user) {
        return response()->json(['error' => 'member@test.com not found in this database'], 404);
    }

    $user->password = \Illuminate\Support\Facades\Hash::make('Member@123');
    $user->save();

    return response()->json([
        'message' => 'Password reset successfully',
        'email' => $user->email,
        'new_password' => 'Member@123',
    ]);
});

Route::get('/temp-list-users-xk29', function () {
    return response()->json(
        \App\Models\User::all(['id', 'name', 'email', 'role'])
    );
});

Route::get('/{any}', function () {
    return file_get_contents(public_path('build/index.html'));
})->where('any', '^(?!api).*$');