import React, { useState, useEffect } from 'react';
import { ListTodo, Search, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

const statusColors = {
    to_do: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-amber-100 text-amber-700',
    review: 'bg-violet-100 text-violet-700',
    completed: 'bg-emerald-100 text-emerald-700',
    blocked: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
};

const priorityColors = {
    low: 'bg-emerald-50 text-emerald-600',
    medium: 'bg-amber-50 text-amber-600',
    high: 'bg-red-50 text-red-600',
    critical: 'bg-red-100 text-red-700',
};

const emptyForm = {
    id: null,
    project_id: '',
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    status: 'to_do',
    due_date: '',
};

const ManagerTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [projectMembers, setProjectMembers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await client.get('/manager/tasks', {
                params: { status: statusFilter, priority: priorityFilter }
            });
            setTasks(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await client.get('/manager/projects');
            setProjects(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load projects');
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => fetchTasks(), 200);
        return () => clearTimeout(delay);
    }, [statusFilter, priorityFilter]);

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setForm(emptyForm);
        setProjectMembers([]);
        setShowModal(true);
    };

    const openEditModal = (task) => {
        setForm({
            id: task.id,
            project_id: task.project_id,
            title: task.title,
            description: task.description || '',
            assigned_to: task.assigned_to || '',
            priority: task.priority,
            status: task.status,
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
        });
        if (task.project_id) fetchProjectMembers(task.project_id);
        setShowModal(true);
    };

    const fetchProjectMembers = async (projectId) => {
        if (!projectId) {
            setProjectMembers([]);
            return;
        }
        try {
            const response = await client.get(`/manager/projects/${projectId}`);
            setProjectMembers(response.data.project.members || []);
        } catch (error) {
            setProjectMembers([]);
        }
    };

    const handleProjectChange = (projectId) => {
        setForm({ ...form, project_id: projectId, assigned_to: '' });
        fetchProjectMembers(projectId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                project_id: form.project_id,
                title: form.title,
                description: form.description,
                assigned_to: form.assigned_to || null,
                priority: form.priority,
                status: form.status,
                due_date: form.due_date,
            };

            if (form.id) {
                await client.put(`/manager/tasks/${form.id}`, payload);
                toast.success('Task updated successfully');
            } else {
                await client.post('/manager/tasks', payload);
                toast.success('Task created successfully');
            }

            setShowModal(false);
            fetchTasks();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save task';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await client.delete(`/manager/tasks/${id}`);
            toast.success('Task deleted');
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            toast.error('Failed to delete task');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <ListTodo className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Task
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="">All Status</option>
                    <option value="to_do">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            {/* Task Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">No tasks found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Title</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Project</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Assignee</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Priority</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Due Date</th>
                                <th className="text-right px-6 py-3 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{task.title}</td>
                                    <td className="px-6 py-3 text-slate-600">{task.project?.name || '-'}</td>
                                    <td className="px-6 py-3 text-slate-600">{task.assignee?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[task.status]}`}>{task.status?.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-3 text-right space-x-1">
                                        <button onClick={() => openEditModal(task)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(task.id)} disabled={deletingId === task.id} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            {deletingId === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900">{form.id ? 'Edit Task' : 'New Task'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                                <select
                                    required
                                    value={form.project_id}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="">Select a project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                                <select
                                    value={form.assigned_to}
                                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="">Unassigned</option>
                                    {projectMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                {form.project_id && projectMembers.length === 0 && (
                                    <p className="text-xs text-slate-400 mt-1">No team members on this project yet.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.due_date}
                                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            {form.id && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="to_do">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="review">Review</option>
                                        <option value="completed">Completed</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {form.id ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTasks;