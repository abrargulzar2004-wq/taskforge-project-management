import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ListChecks, CheckCircle2, Clock, CalendarClock, Bell } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await client.get('/dashboard/member');
                setData(response.data);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data) return null;

    const { cards, recent_notifications } = data;

    const statCards = [
        { label: 'Assigned Tasks', value: cards.assigned_tasks, icon: ListChecks, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Completed', value: cards.completed_tasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending', value: cards.pending_tasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: "Today's Tasks", value: cards.todays_tasks, icon: CalendarClock, color: 'text-sky-600', bg: 'bg-sky-50' },
        { label: 'Upcoming Deadlines', value: cards.upcoming_deadlines, icon: Bell, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Dashboard</h1>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((c) => (
                    <div key={c.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${c.bg} mb-3`}>
                            <c.icon className={`w-5 h-5 ${c.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                        <p className="text-sm text-slate-500 mt-1">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
                        <Bell className="w-4 h-4 mr-2 text-slate-400" /> Recent Notifications
                    </h3>
                </div>
                {recent_notifications && recent_notifications.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                        {recent_notifications.map((n) => (
                            <li key={n.id} className="px-6 py-3 text-sm text-slate-700">
                                {n.data?.message || n.message || 'Notification'}
                                <span className="block text-xs text-slate-400 mt-1">
                                    {new Date(n.created_at).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-6 py-8 text-center text-sm text-slate-500">No recent notifications.</div>
                )}
            </div>
        </div>
    );
};

export default MemberDashboard;