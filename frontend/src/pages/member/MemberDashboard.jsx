import React, { useState, useEffect } from 'react';
import { ListTodo, CheckCircle2, Clock, CalendarClock, AlertTriangle, Bell } from 'lucide-react';
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

    const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${bgColorClass}`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Assigned Tasks" value={cards.assigned_tasks} icon={ListTodo} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" />
                <StatCard title="Completed Tasks" value={cards.completed_tasks} icon={CheckCircle2} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
                <StatCard title="Pending Tasks" value={cards.pending_tasks} icon={Clock} colorClass="text-amber-600" bgColorClass="bg-amber-50" />
                <StatCard title="Today's Tasks" value={cards.todays_tasks} icon={CalendarClock} colorClass="text-violet-600" bgColorClass="bg-violet-50" />
                <StatCard title="Upcoming Deadlines" value={cards.upcoming_deadlines} icon={AlertTriangle} colorClass="text-red-600" bgColorClass="bg-red-50" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Recent Notifications</h3>
                    <Bell className="w-4 h-4 text-slate-400" />
                </div>
                <div className="divide-y divide-slate-100">
                    {recent_notifications && recent_notifications.length > 0 ? (
                        recent_notifications.map((n) => {
                            const msg = n.data?.message || n.data?.text || 'New notification';
                            return (
                                <div key={n.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <p className="text-sm text-slate-900">{msg}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-6 py-8 text-center text-sm text-slate-500">
                            No recent notifications.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;