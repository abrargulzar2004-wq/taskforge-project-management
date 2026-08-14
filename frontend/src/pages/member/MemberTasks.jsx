import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Calendar, Flag } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['to_do', 'in_progress', 'review', 'completed', 'blocked'];

const STATUS_LABELS = {
    to_do: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    completed: 'Completed',
    blocked: 'Blocked',
};

const STATUS_COLORS = {
    to_do: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-sky-100 text-sky-700',
    review: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    blocked: 'bg-rose-100 text-rose-700',
};

const PRIORITY_COLORS = {
    low: 'text-slate-500',
    medium: 'text-sky-600',
    high: 'text-amber-600',
    critical: 'text-rose-600',
};

const MemberTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (priorityFilter) params.priority = priorityFilter;
            const response = await client.get('/member/tasks', { params });
            setTasks(response.data.data || response.data);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, priorityFilter]);

    const handleStatusChange = async (taskId, newStatus) => {
        setUpdatingId(taskId);
        try {
            await client.patch(`/member/tasks/${taskId}/status`, { status: newStatus });
            toast.success('Task status updated');
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
            );
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <ListChecks className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            {loading ? (
                <div className="flex h-full items-center justify-center min-h-[40vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-12 text-center text-sm text-slate-500">
                    No tasks assigned yet.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Task</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Project</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Priority</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Due Date</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tasks.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3">
                                        <Link
                                            to={`/member/tasks/${t.id}`}
                                            className="font-medium text-slate-900 hover:text-indigo-600"
                                        >
                                            {t.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{t.project?.name || '—'}</td>
                                    <td className={`px-6 py-3 font-medium ${PRIORITY_COLORS[t.priority] || 'text-slate-500'}`}>
                                        <span className="inline-flex items-center">
                                            <Flag className="w-3.5 h-3.5 mr-1" />
                                            {t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">
                                        <span className="inline-flex items-center">
                                            <Calendar className="w-3.5 h-3.5 mr-1" />
                                            {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <select
                                            value={t.status}
                                            disabled={updatingId === t.id}
                                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                            className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer ${STATUS_COLORS[t.status] || 'bg-slate-100 text-slate-700'}`}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MemberTasks;