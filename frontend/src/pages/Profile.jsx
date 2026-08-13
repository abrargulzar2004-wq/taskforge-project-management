import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Phone, MapPin, Lock, Save, Loader2 } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [avatarFile, setAvatarFile] = useState(null);

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await client.get('/profile');
                const u = response.data.user;
                setUser(u);
                setForm({
                    name: u.name || '',
                    phone: u.phone || '',
                    address: u.address || ''
                });
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('phone', form.phone || '');
            formData.append('address', form.address || '');
            if (avatarFile) formData.append('avatar', avatarFile);
            // Laravel needs this trick for PUT + FormData
            formData.append('_method', 'PUT');

            const response = await client.post('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(response.data.user);
            toast.success('Profile updated successfully');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setSavingPassword(true);
        try {
            await client.patch('/profile/password', passwordForm);
            toast.success('Password updated successfully');
            setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            const msg = error.response?.data?.errors?.current_password?.[0]
                || error.response?.data?.message
                || 'Failed to update password';
            toast.error(msg);
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center space-x-3">
                <UserCircle className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile</h1>
            </div>

            {/* Profile Info Card */}
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <h3 className="text-lg font-semibold text-slate-900">Account Details</h3>

                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl overflow-hidden">
                        {user?.avatar ? (
                            <img src={`/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAvatarFile(e.target.files[0])}
                            className="text-sm text-slate-600"
                        />
                        <p className="text-xs text-slate-400 mt-1">JPG or PNG, max 2MB</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-slate-400" /> Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                            <Phone className="w-4 h-4 mr-1 text-slate-400" /> Phone
                        </label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-slate-400" /> Address
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </button>
            </form>

            {/* Password Card */}
            <form onSubmit={handlePasswordSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-slate-400" /> Change Password
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={passwordForm.password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            minLength={8}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordForm.password_confirmation}
                            onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            minLength={8}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
                >
                    {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default Profile;