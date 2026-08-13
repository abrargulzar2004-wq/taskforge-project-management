import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Calendar, DollarSign, Eye } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const projectSchema = z.object({
    name: z.string().min(2, "Project name is required"),
    description: z.string().min(5, "Description is required"),
    category: z.string().optional().or(z.literal('')),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
    budget: z.string().optional().or(z.literal('')),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    project_manager_id: z.string().min(1, "A project manager must be assigned"),
});

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            priority: 'medium',
            status: 'planning',
        }
    });

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                search: searchQuery,
                status: statusFilter,
            });
            const response = await client.get(`/admin/projects?${params}`);
            setProjects(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await client.get('/admin/users?role=project_manager&per_page=100');
            setManagers(response.data.data);
        } catch (error) {
            toast.error("Failed to load project managers");
        }
    };

    useEffect(() => {
        fetchManagers();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchProjects();
        }, 300);
        return () => clearTimeout(handler);
    }, [page, searchQuery, statusFilter]);

    const handleOpenModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setValue('name', project.name);
            setValue('description', project.description);
            setValue('category', project.category || '');
            setValue('priority', project.priority);
            setValue('status', project.status);
            setValue('budget', project.budget || '');
            setValue('start_date', project.start_date?.split('T')[0]);
            setValue('end_date', project.end_date?.split('T')[0]);
            setValue('project_manager_id', String(project.project_manager_id));
        } else {
            setEditingProject(null);
            reset({ priority: 'medium', status: 'planning' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        reset();
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            budget: data.budget || null,
            project_manager_id: parseInt(data.project_manager_id, 10),
        };

        setIsSubmitting(true);
        try {
            if (editingProject) {
                await client.put(`/admin/projects/${editingProject.id}`, payload);
                toast.success("Project updated successfully");
            } else {
                await client.post('/admin/projects', payload);
                toast.success("Project created successfully");
            }
            handleCloseModal();
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save project");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this project? This can be restored later if needed.")) {
            try {
                await client.delete(`/admin/projects/${id}`);
                toast.success("Project deleted successfully");
                fetchProjects();
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete project");
            }
        }
    };

    const PriorityBadge = ({ priority }) => {
        const colors = {
            low: 'text-slate-600 bg-slate-50 ring-slate-500/10',
            medium: 'text-amber-700 bg-amber-100 ring-amber-600/20',
            high: 'text-orange-700 bg-orange-100 ring-orange-600/20',
            critical: 'text-red-700 bg-red-100 ring-red-600/20',
        };
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[priority]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            planning: 'text-slate-600 bg-slate-50 ring-slate-500/10',
            active: 'text-emerald-700 bg-emerald-50 ring-emerald-600/20',
            on_hold: 'text-amber-700 bg-amber-100 ring-amber-600/20',
            completed: 'text-indigo-700 bg-indigo-100 ring-indigo-600/20',
            cancelled: 'text-red-700 bg-red-100 ring-red-600/20',
        };
        const label = status.replace('_', ' ');
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[status]}`}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Search projects by name or code..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>
                    <select
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Manager</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </td>
                                </tr>
                            ) : projects.length > 0 ? (
                                projects.map(project => (
                                    <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/admin/projects/${project.id}`} className="group">
                                                <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{project.project_code}</div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {project.manager?.name || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <PriorityBadge priority={project.priority} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={project.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${project.completion_percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-500">{project.completion_percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    to={`/admin/projects/${project.id}`}
                                                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleOpenModal(project)}
                                                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No projects found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-700">
                            Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingProject ? 'Edit Project' : 'Create New Project'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                        <input
                            type="text"
                            {...register('name')}
                            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            rows="3"
                            {...register('description')}
                            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <input
                                type="text"
                                placeholder="e.g. Web Development"
                                {...register('category')}
                                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Budget ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('budget')}
                                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select
                                {...register('priority')}
                                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                {...register('status')}
                                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="planning">Planning</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                {...register('start_date')}
                                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input
                                type="date"
                                {...register('end_date')}
                                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Manager</label>
                        <select
                            {...register('project_manager_id')}
                            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select a manager...</option>
                            {managers.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        {errors.project_manager_id && <p className="mt-1 text-sm text-red-600">{errors.project_manager_id.message}</p>}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminProjects;