use App\Models\User;
use Illuminate\Support\Facades\Hash;

Route::get('/temp-reset-manager-password', function () {
    $user = User::where('email', 'john@taskforge.com')->first();
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }
    $user->password = Hash::make('password123');
    $user->save();
    return response()->json(['message' => 'Password reset successfully for ' . $user->email]);
});