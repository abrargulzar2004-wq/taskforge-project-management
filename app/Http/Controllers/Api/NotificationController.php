<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()->latest()->paginate(15);
        
        $unreadCount = $user->unreadNotifications()->count();

        // Attach unread_count alongside the paginated data
        $response = $notifications->toArray();
        $response['unread_count'] = $unreadCount;

        return response()->json($response, 200);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => $notification
        ], 200);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        
        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.'
        ], 200);
    }
}
