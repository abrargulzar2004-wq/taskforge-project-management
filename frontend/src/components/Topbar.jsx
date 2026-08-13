import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Fetch unread notifications count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await client.get('/notifications');
                setUnreadCount(response.data.unread_count || 0);
            } catch (error) {
                console.error("Failed to fetch notifications count", error);
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    // Debounced Search
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const response = await client.get(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setSearchResults(response.data);
                    setIsSearchOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSearchResults(null);
                setIsSearchOpen(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Click outside search to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchItemClick = (path) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate(path);
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                        placeholder="Search projects, tasks, users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchResults) setIsSearchOpen(true); }}
                    />
                </div>

                {/* Search Dropdown */}
                {isSearchOpen && searchResults && (
                    <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                        {searchResults.projects?.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase">Projects</div>
                                {searchResults.projects.map(p => (
                                    <div key={`p-${p.id}`} onClick={() => handleSearchItemClick(`/${user.role === 'admin' ? 'admin' : 'manager'}/projects/${p.id}`)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm">
                                        <div className="font-medium text-slate-900">{p.name}</div>
                                        <div className="text-xs text-slate-500">{p.project_code}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.tasks?.length > 0 && (
                            <div className="py-2 border-t border-slate-100">
                                <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase">Tasks</div>
                                {searchResults.tasks.map(t => (
                                    <div key={`t-${t.id}`} onClick={() => handleSearchItemClick(`/${user.role === 'team_member' ? 'member' : 'manager'}/tasks/${t.id}`)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm">
                                        <div className="font-medium text-slate-900">{t.title}</div>
                                        <div className="text-xs text-slate-500">Project: {t.project?.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.users?.length > 0 && user.role === 'admin' && (
                            <div className="py-2 border-t border-slate-100">
                                <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase">Users</div>
                                {searchResults.users.map(u => (
                                    <div key={`u-${u.id}`} onClick={() => handleSearchItemClick(`/admin/users`)} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm flex items-center">
                                        <div className="w-6 h-6 bg-slate-200 rounded-full mr-3"></div>
                                        <div>
                                            <div className="font-medium text-slate-900">{u.name}</div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(!searchResults.projects?.length && !searchResults.tasks?.length && !searchResults.users?.length) && (
                            <div className="p-4 text-sm text-slate-500 text-center">No results found for "{searchQuery}"</div>
                        )}
                    </div>
                )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-6 ml-4">
                <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold text-center leading-4 ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-slate-900 leading-none mb-1">{user?.name}</div>
                        <div className="text-xs text-slate-500 leading-none capitalize">{user?.role?.replace('_', ' ')}</div>
                    </div>
                    <Link to="/profile" className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all">
                        {user?.avatar ? (
                            <img src={`http://127.0.0.1:8001/storage/${user.avatar}`} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                            <UserIcon className="h-5 w-5" />
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
