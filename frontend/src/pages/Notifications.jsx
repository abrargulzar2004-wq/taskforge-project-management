import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const fetchNotifications = async () => {
        try {
            const response = await client.get('/notifications');
            setNotifications(response.data.data || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        setActionId(id);
        try {
            await client.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Failed to mark as read');
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id) => {
        setActionId(id);
        try {
            await client.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        } finally {
            setActionId(null);
        }
    };

    const getMessage = (notification) => {
        const data = notification.data || {};
        return data.message || data.text || `Notification: ${notification.type?.split('\\').pop() || 'Update'}`;
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Bell className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                        {unreadCount} unread
                    </span>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-500">
                        No notifications yet.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-6 py-4 flex items-start justify-between space-x-4 hover:bg-slate-50 transition-colors ${!notification.read_at ? 'bg-indigo-50/40' : ''}`}
                            >
                                <div className="flex items-start space-x-3 flex-1">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.read_at ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                                    <div>
                                        <p className="text-sm text-slate-900">{getMessage(notification)}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    {!notification.read_at && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            disabled={actionId === notification.id}
                                            title="Mark as read"
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {actionId === notification.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        disabled={actionId === notification.id}
                                        title="Delete"
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;