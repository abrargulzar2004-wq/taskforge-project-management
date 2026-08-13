import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Placeholders for Group 2 (Admin)
const AdminDashboard = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Admin Dashboard Placeholder</div>;
const AdminUsers = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Admin Users Placeholder</div>;
const AdminProjects = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Admin Projects Placeholder</div>;
const AdminReports = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Admin Reports Placeholder</div>;

// Placeholders for Group 3 (Manager)
const ManagerDashboard = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Manager Dashboard Placeholder</div>;
const ManagerProjects = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Manager Projects Placeholder</div>;
const ManagerTasks = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Manager Tasks Placeholder</div>;
const ManagerReports = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Manager Reports Placeholder</div>;

// Placeholders for Group 4 (Member)
const MemberDashboard = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Member Dashboard Placeholder</div>;
const MemberTasks = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Member Tasks Placeholder</div>;

// Placeholders for Group 5 (Shared)
const Calendar = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Calendar Placeholder</div>;
const Profile = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Profile Placeholder</div>;
const Notifications = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Notifications Placeholder</div>;

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Root Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Authenticated Routes with Layout */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            {/* Shared Routes */}
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/notifications" element={<Notifications />} />

                            {/* Admin Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/admin/users" element={<AdminUsers />} />
                                <Route path="/admin/projects" element={<AdminProjects />} />
                                <Route path="/admin/projects/:id" element={<AdminProjects />} />
                                <Route path="/admin/reports" element={<AdminReports />} />
                            </Route>

                            {/* Manager Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['project_manager']} />}>
                                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                                <Route path="/manager/projects" element={<ManagerProjects />} />
                                <Route path="/manager/projects/:id" element={<ManagerProjects />} />
                                <Route path="/manager/tasks" element={<ManagerTasks />} />
                                <Route path="/manager/tasks/:id" element={<ManagerTasks />} />
                                <Route path="/manager/reports" element={<ManagerReports />} />
                            </Route>

                            {/* Member Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['team_member']} />}>
                                <Route path="/member/dashboard" element={<MemberDashboard />} />
                                <Route path="/member/tasks" element={<MemberTasks />} />
                                <Route path="/member/tasks/:id" element={<MemberTasks />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
