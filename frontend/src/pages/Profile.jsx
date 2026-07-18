import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        username: ''
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    // ✅ READ - Profile load करो
    const loadProfile = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setFormData({
                    full_name: userData.full_name || '',
                    email: userData.email || '',
                    username: userData.username || ''
                });
            }
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // ✅ UPDATE - Profile update करो
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axiosInstance.put('/api/auth/profile/update', {
                full_name: formData.full_name,
                username: formData.username
            });

            // Update localStorage
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setSuccess('✅ Profile updated successfully!');
            setEditMode(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error updating profile');
        }
    };

    // ✅ UPDATE - Password change करो
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('❌ Passwords do not match!');
            return;
        }

        if (passwordData.new_password.length < 6) {
            setError('❌ Password must be at least 6 characters');
            return;
        }

        try {
            await axiosInstance.post('/api/auth/change-password', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });

            setSuccess('✅ Password changed successfully!');
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            setShowPasswordForm(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error changing password');
        }
    };

    // ✅ DELETE - Account delete करो
    const handleDeleteAccount = async () => {
        if (!window.confirm('⚠️ Are you sure? This cannot be undone!')) return;

        try {
            await axiosInstance.delete('/api/auth/delete-account');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error deleting account');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return { bg: '#fee2e2', text: '#dc2626', label: '👑 Admin' };
            case 'store_manager': return { bg: '#fef3c7', text: '#d97706', label: '📋 Manager' };
            case 'inventory_staff': return { bg: '#dbeafe', text: '#0369a1', label: '📦 Staff' };
            case 'viewer': return { bg: '#f0fdf4', text: '#16a34a', label: '👁️ Viewer' };
            default: return { bg: '#f3f4f6', text: '#6b7280', label: role };
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginTop: '8px'
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '48px' }}>Loading...</div>;

    if (!user) return <div style={{ textAlign: 'center', padding: '48px', color: '#dc2626' }}>User not found</div>;

    const roleColor = getRoleColor(user.role);

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>My Profile</h1>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                        {success}
                    </div>
                )}

                {/* Profile Card */}
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                    {/* Avatar + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{
                            backgroundColor: '#667eea',
                            color: 'white',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '32px'
                        }}>
                            {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                        </div>

                        <div>
                            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                                {user.full_name || 'User'}
                            </h2>
                            <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                                {user.email}
                            </p>
                            <span style={{
                                backgroundColor: roleColor.bg,
                                color: roleColor.text,
                                padding: '6px 14px',
                                borderRadius: '999px',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}>
                                {roleColor.label}
                            </span>
                        </div>
                    </div>

                    {/* Profile Details */}
                    {!editMode ? (
                        <div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Full Name</label>
                                <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                                    {user.full_name || 'Not set'}
                                </p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Username</label>
                                <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                                    {user.username}
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontWeight: '500', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Email</label>
                                <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                                    {user.email}
                                </p>
                            </div>

                            <button
                                onClick={() => setEditMode(true)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                ✏️ Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="John Doe"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block' }}>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="john_doe"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block' }}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    style={{ ...inputStyle, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                                />
                                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Email cannot be changed</p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#16a34a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    💾 Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Security Section */}
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>🔒 Security</h3>

                    {!showPasswordForm ? (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            🔑 Change Password
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block' }}>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.old_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                    placeholder="••••••••"
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block' }}>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    placeholder="••••••••"
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    placeholder="••••••••"
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#16a34a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Update Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordForm(false)}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Danger Zone */}
                <div style={{ backgroundColor: '#fef2f2', padding: '32px', borderRadius: '12px', border: '2px solid #fecaca', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>⚠️ Danger Zone</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>Once you delete your account, there is no going back. Please be certain.</p>
                    <button
                        onClick={handleDeleteAccount}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🗑️ Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}