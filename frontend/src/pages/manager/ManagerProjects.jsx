import React, { useState, useEffect } from 'react';
import { FolderKanban, Search, Calendar, User } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

const statusColors = {
    planning: 'bg-amber-100 text-amber-700',
    active: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-slate-100 text-slate-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
};

const priorityColors = {
    low: 'bg-emerald-50 text-emerald-600',
    medium: 'bg-amber-50 text-amber-600',
    high: 'bg-red-50 text-red-600',
    critical: 'bg-red-100 text-red-700',
};

const ManagerProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await client.get('/manager/projects', {
                params: { search, status, priority }
            });
            setProjects(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchProjects(), 300);
        return () => clearTimeout(delay);
    }, [search, status, priority]);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <FolderKanban className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Projects</h1>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            {/* Project Cards */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-12 text-center text-sm text-slate-500">
                    No projects assigned to you yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[project.status] || 'bg-slate-100 text-slate-600'}`}>
                                    {project.status?.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description || 'No description provided.'}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full font-medium ${priorityColors[project.priority] || 'bg-slate-50 text-slate-500'}`}>
                                    {project.priority}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagerProjects;