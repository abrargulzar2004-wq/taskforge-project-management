import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    FolderKanban, 
    BarChart3, 
    Bell, 
    UserCircle, 
    LogOut,
    CheckSquare,
    Calendar
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    ];

    const managerLinks = [
        { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
        { name: 'My Projects', path: '/manager/projects', icon: FolderKanban },
        { name: 'Tasks', path: '/manager/tasks', icon: CheckSquare },
        { name: 'Reports', path: '/manager/reports', icon: BarChart3 },
    ];

    const memberLinks = [
        { name: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
        { name: 'My Tasks', path: '/member/tasks', icon: CheckSquare },
    ];

    const sharedLinks = [
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Profile', path: '/profile', icon: UserCircle },
    ];

    let links = [];
    if (user?.role === 'admin') links = adminLinks;
    if (user?.role === 'project_manager') links = managerLinks;
    if (user?.role === 'team_member') links = memberLinks;

    const baseLinkStyle = "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group mb-1";
    const inactiveStyle = "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50";
    const activeStyle = "text-indigo-700 bg-indigo-100";

    return (
        <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed inset-y-0 left-0 z-20">
            <div className="p-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">TaskForge</span>
            </div>

            <div className="flex-1 px-4 overflow-y-auto pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                    Menu
                </div>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) => 
                                    `${baseLinkStyle} ${isActive ? activeStyle : inactiveStyle}`
                                }
                            >
                                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                {link.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-8">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                        Account
                    </div>
                    <nav className="space-y-1">
                        {sharedLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) => 
                                        `${baseLinkStyle} ${isActive ? activeStyle : inactiveStyle}`
                                    }
                                >
                                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    {link.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200">
                <button 
                    onClick={logout}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
