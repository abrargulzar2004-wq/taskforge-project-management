import React, { useState, useEffect } from 'react';
import { FileBarChart2, Users, FolderKanban, CheckCircle2, Clock } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import client from '../../api/client';
import toast from 'react-hot-toast';

const AdminReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await client.get('/dashboard/admin');
                setData(response.data);
            } catch (error) {
                toast.error("Failed to load report data");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data) return null;

    const { cards, charts } = data;

    const projectsData = [
        { name: 'Active', value: charts.projects_by_status.active || 0, color: '#3b82f6' },
        { name: 'Planning', value: charts.projects_by_status.planning || 0, color: '#f59e0b' },
        { name: 'Completed', value: charts.projects_by_status.completed || 0, color: '#10b981' },
        { name: 'On Hold', value: charts.projects_by_status.on_hold || 0, color: '#64748b' },
        { name: 'Cancelled', value: charts.projects_by_status.cancelled || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);

    const tasksData = [
        { name: 'To Do', value: charts.tasks_by_status.to_do || 0, color: '#64748b' },
        { name: 'In Progress', value: charts.tasks_by_status.in_progress || 0, color: '#f59e0b' },
        { name: 'Review', value: charts.tasks_by_status.review || 0, color: '#8b5cf6' },
        { name: 'Completed', value: charts.tasks_by_status.completed || 0, color: '#10b981' },
        { name: 'Blocked', value: charts.tasks_by_status.blocked || 0, color: '#ef4444' },
    ];

    const SummaryCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
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
            <div className="flex items-center space-x-3">
                <FileBarChart2 className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Users" value={cards.total_users} icon={Users} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" />
                <SummaryCard title="Active Projects" value={cards.active_projects} icon={FolderKanban} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
                <SummaryCard title="Pending Tasks" value={cards.pending_tasks} icon={Clock} colorClass="text-amber-600" bgColorClass="bg-amber-50" />
                <SummaryCard title="Overdue Tasks" value={cards.overdue_tasks} icon={CheckCircle2} colorClass="text-red-600" bgColorClass="bg-red-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Tasks by Status</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tasksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {tasksData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Projects by Status</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={projectsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {projectsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;