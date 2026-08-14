import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Trash2, Flag, Calendar, User as UserIcon } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
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

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isMember = user?.role === 'team_member';

    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const basePath = isMember ? '/member/tasks' : '/manager/tasks';

    const fetchTask = async () => {
        setLoading(true);
        try {
            const response = await client.get(`${basePath}/${id}`);
            const t = response.data.task;
            setTask(t);
            setComments(t.comments || []);
        } catch (error) {
            toast.error('Failed to load task');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTask();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await client.patch(`/member/tasks/${id}/status`, { status: newStatus });
            setTask((prev) => ({ ...prev, status: newStatus }));
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || newComment.trim().length < 2) {
            toast.error('Comment must be at least 2 characters');
            return;
        }
        setPosting(true);
        try {
            const response = await client.post(`/tasks/${id}/comments`, { comment: newComment.trim() });
            setComments((prev) => [...prev, response.data.comment]);
            setNewComment('');
        } catch (error) {
            toast.error('Failed to post comment');
        } finally {
            setPosting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await client.delete(`/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!task) return null;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate(basePath)}
                className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tasks
            </button>

            {/* Task Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{task.title}</h1>
                    {isMember ? (
                        <select
                            value={task.status}
                            disabled={updatingStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer ${STATUS_COLORS[task.status] || 'bg-slate-100 text-slate-700'}`}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                        </select>
                    ) : (
                        <span className={`text-xs font-semibold rounded-full px-3 py-1.5 ${STATUS_COLORS[task.status] || 'bg-slate-100 text-slate-700'}`}>
                            {STATUS_LABELS[task.status] || task.status}
                        </span>
                    )}
                </div>

                {task.description && (
                    <p className="text-sm text-slate-600">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-600">
                        <Flag className={`w-4 h-4 mr-1.5 ${PRIORITY_COLORS[task.priority] || 'text-slate-500'}`} />
                        {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)} Priority
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </div>
                    {task.assignee && (
                        <div className="flex items-center text-sm text-slate-600">
                            <UserIcon className="w-4 h-4 mr-1.5" />
                            Assigned to {task.assignee.name}
                        </div>
                    )}
                    {task.project && (
                        <div className="text-sm text-slate-600">
                            Project: <span className="font-medium">{task.project.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments / Task Discussion */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-slate-400" /> Discussion ({comments.length})
                    </h3>
                </div>

                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {comments.length > 0 ? (
                        comments.map((c) => (
                            <div key={c.id} className="px-6 py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-900">{c.user?.name || 'Unknown'}</span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(c.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-1">{c.comment}</p>
                                    </div>
                                    {(c.user_id === user?.id || user?.role === 'admin') && (
                                        <button
                                            onClick={() => handleDeleteComment(c.id)}
                                            className="text-slate-300 hover:text-rose-500 ml-3"
                                            title="Delete comment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-sm text-slate-500">
                            No comments yet. Start the discussion below.
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-end gap-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handlePostComment}
                        disabled={posting}
                        className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                        <Send className="w-4 h-4 mr-1.5" /> Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;