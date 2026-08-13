import React, { useState, useEffect } from 'react';
import { 
    Users, 
    FolderKanban, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Activity 
} from 'lucide-react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid 
} from 'recharts';
import client from '../../api/client';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await client.get('/dashboard/admin');
                setData(response.data);
            } catch (error) {
                toast.error("Failed to load dashboard data");
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

    const { cards, charts, recent_activity, recent_users } = data;

    // Format Data for Recharts
    const projectsData = [
        { name: 'Active', value: charts.projects_by_status.active || 0, color: '#3b82f6' }, // blue-500
        { name: 'Planning', value: charts.projects_by_status.planning || 0, color: '#f59e0b' }, // amber-500
        { name: 'Completed', value: charts.projects_by_status.completed || 0, color: '#10b981' }, // emerald-500
        { name: 'On Hold', value: charts.projects_by_status.on_hold || 0, color: '#64748b' }, // slate-500
        { name: 'Cancelled', value: charts.projects_by_status.cancelled || 0, color: '#ef4444' }, // red-500
    ].filter(item => item.value > 0);

    const tasksData = [
        { name: 'To Do', value: charts.tasks_by_status.to_do || 0, color: '#64748b' }, // slate-500
        { name: 'In Progress', value: charts.tasks_by_status.in_progress || 0, color: '#f59e0b' }, // amber-500
        { name: 'Review', value: charts.tasks_by_status.review || 0, color: '#8b5cf6' }, // violet-500
        { name: 'Completed', value: charts.tasks_by_status.completed || 0, color: '#10b981' }, // emerald-500
        { name: 'Blocked', value: charts.tasks_by_status.blocked || 0, color: '#ef4444' }, // red-500
    ];

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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={cards.total_users} 
                    icon={Users} 
                    colorClass="text-indigo-600" 
                    bgColorClass="bg-indigo-50" 
                />
                <StatCard 
                    title="Active Projects" 
                    value={cards.active_projects} 
                    icon={FolderKanban} 
                    colorClass="text-emerald-600" 
                    bgColorClass="bg-emerald-50" 
                />
                <StatCard 
                    title="Pending Tasks" 
                    value={cards.pending_tasks} 
                    icon={Clock} 
                    colorClass="text-amber-600" 
                    bgColorClass="bg-amber-50" 
                />
                <StatCard 
                    title="Overdue Tasks" 
                    value={cards.overdue_tasks} 
                    icon={AlertCircle} 
                    colorClass="text-red-600" 
                    bgColorClass="bg-red-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 tracking-tight">Tasks by Status</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={tasksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {tasksData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">Projects Overview</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={projectsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {projectsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Recent Platform Activity</h3>
                    <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div className="divide-y divide-slate-100">
                    {recent_activity && recent_activity.length > 0 ? (
                        recent_activity.map(activity => (
                            <div key={activity.id} className="px-6 py-4 flex items-start space-x-4 hover:bg-slate-50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-semibold text-sm">
                                    {activity.user?.name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-900">
                                        <span className="font-medium">{activity.user?.name || 'System'}</span> {activity.action} <span className="font-medium">{activity.subject_type.split('\\').pop()}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-sm text-slate-500">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
