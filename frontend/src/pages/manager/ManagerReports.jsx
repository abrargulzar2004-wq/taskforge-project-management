import React, { useState, useEffect } from 'react';
import { FileBarChart2, CheckCircle2, Users, FolderKanban } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

const ManagerReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await client.get('/manager/reports');
                setData(response.data);
            } catch (error) {
                toast.error('Failed to load report data');
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

    const { task_completion, project_progress, member_performance } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <FileBarChart2 className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
            </div>

            {/* Overall Task Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-600" /> Overall Task Completion
                    </h3>
                    <span className="text-2xl font-bold text-indigo-600">{task_completion.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                    <div
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${task_completion.percentage}%` }}
                    ></div>
                </div>
                <p className="text-sm text-slate-500">{task_completion.completed} of {task_completion.total} tasks completed</p>
            </div>

            {/* Project Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <FolderKanban className="w-5 h-5 mr-2 text-emerald-600" /> Project Progress
                </h3>
                {project_progress && project_progress.length > 0 ? (
                    <div className="space-y-4">
                        {project_progress.map((p) => (
                            <div key={p.project_id}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-700">{p.name}</span>
                                    <span className="text-sm text-slate-500">{p.completion_percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all"
                                        style={{ width: `${p.completion_percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">No projects assigned yet.</p>
                )}
            </div>

            {/* Member Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
                        <Users className="w-4 h-4 mr-2 text-slate-400" /> Team Member Performance
                    </h3>
                </div>
                {member_performance && member_performance.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-6 py-2 font-semibold text-slate-600">Member</th>
                                <th className="text-left px-6 py-2 font-semibold text-slate-600">Assigned</th>
                                <th className="text-left px-6 py-2 font-semibold text-slate-600">Completed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {member_performance.map((m) => (
                                <tr key={m.user_id}>
                                    <td className="px-6 py-3 font-medium text-slate-900">{m.name}</td>
                                    <td className="px-6 py-3 text-slate-600">{m.tasks_assigned}</td>
                                    <td className="px-6 py-3 text-slate-600">{m.tasks_completed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="px-6 py-8 text-center text-sm text-slate-500">No team members yet.</div>
                )}
            </div>
        </div>
    );
};

export default ManagerReports;