import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
                <Topbar />
                <main className="flex-1 p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            <Toaster 
                position="top-right" 
                toastOptions={{
                    className: 'text-sm font-medium',
                    style: {
                        background: '#334155',
                        color: '#fff',
                    }
                }} 
            />
        </div>
    );
};

export default Layout;
