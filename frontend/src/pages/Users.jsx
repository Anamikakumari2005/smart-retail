import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'inventory_staff'
    });

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const res = await axiosInstance.get('/api/users/');
            setUsers(res.data);
            setError('');
        } catch (err) {
            setError('Access denied or users not loaded!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editUser) {
                await axiosInstance.put(`/api/users/${editUser.id}`, {
                    username: form.username,
                    email: form.email,
                    role: form.role
                });
            } else {
                await axiosInstance.post('/api/users/', {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    role: form.role
                });
            }
            setShowForm(false);
            setEditUser(null);
            setForm({ username: '', email: '', password: '', role: 'inventory_staff' });
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Error!');
        }
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setForm({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role
        });
        setShowForm(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axiosInstance.delete(`/api/users/${userId}`);
            loadUsers();
        } catch (err) {
            setError('Delete failed!');
        }
    };

    const toggleActive = async (userId, currentStatus) => {
        try {
            await axiosInstance.put(`/api/users/${userId}`, {
                is_active: !currentStatus
            });
            loadUsers();
        } catch (err) {
            setError('Failed to update user!');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': 
                return { bg: '#fee2e2', text: '#dc2626', label: '👑 Admin' };
            case 'store_manager': 
                return { bg: '#fef3c7', text: '#d97706', label: '📋 Store Manager' };
            case 'inventory_staff': 
                return { bg: '#dbeafe', text: '#0369a1', label: '📦 Inventory Staff' };
            case 'viewer': 
                return { bg: '#f0fdf4', text: '#16a34a', label: '👁️ Viewer' };
            default: 
                return { bg: '#f3f4f6', text: '#6b7280', label: role };
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginTop: '4px'
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px' }}>Loading...</div>;

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Users</h1>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>{users.length} users total</p>
                </div>
                <button
                    onClick={() => { 
                        setShowForm(true); 
                        setEditUser(null); 
                        setForm({ username: '', email: '', password: '', role: 'inventory_staff' }); 
                    }}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: '600', 
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    + Add User
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    ❌ {error}
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '440px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                            {editUser ? 'Edit User' : 'Add User'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Username</label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    placeholder="john_doe"
                                    style={inputStyle}
                                    disabled={!!editUser}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="user@example.com"
                                    style={inputStyle}
                                    disabled={!!editUser}
                                    required
                                />
                            </div>

                            {!editUser && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Password</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••"
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Role</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="viewer">👁️ Viewer (View only)</option>
                                    <option value="inventory_staff">📦 Inventory Staff</option>
                                    <option value="store_manager">📋 Store Manager</option>
                                    <option value="admin">👑 Admin</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    type="submit" 
                                    style={{ 
                                        flex: 1, 
                                        padding: '10px', 
                                        backgroundColor: '#3b82f6', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        fontWeight: '600', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    {editUser ? 'Update' : 'Add'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowForm(false)}
                                    style={{ 
                                        flex: 1, 
                                        padding: '10px', 
                                        backgroundColor: '#f3f4f6', 
                                        color: '#374151', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        fontWeight: '600', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            {['Username', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map((user, i) => {
                            const roleColor = getRoleColor(user.role);
                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>{user.username}</td>
                                    <td style={{ padding: '14px 16px', color: '#374151' }}>{user.email}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ 
                                            backgroundColor: roleColor.bg, 
                                            color: roleColor.text, 
                                            padding: '4px 10px', 
                                            borderRadius: '999px', 
                                            fontSize: '12px', 
                                            fontWeight: '500' 
                                        }}>
                                            {roleColor.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <button
                                            onClick={() => toggleActive(user.id, user.is_active)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: user.is_active ? '#f0fdf4' : '#fee2e2',
                                                color: user.is_active ? '#16a34a' : '#dc2626',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {user.is_active ? '✅ Active' : '❌ Inactive'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleEdit(user)}
                                                style={{ 
                                                    padding: '6px 14px', 
                                                    backgroundColor: '#f0fdf4', 
                                                    color: '#16a34a', 
                                                    border: '1px solid #86efac', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '13px', 
                                                    fontWeight: '500' 
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                style={{ 
                                                    padding: '6px 14px', 
                                                    backgroundColor: '#fef2f2', 
                                                    color: '#dc2626', 
                                                    border: '1px solid #fca5a5', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '13px', 
                                                    fontWeight: '500' 
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Role Info */}
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#111827', fontWeight: '600' }}>📋 Role Permissions:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                    <div>
                        <strong style={{ color: '#111827' }}>👁️ Viewer</strong>
                        <p style={{ margin: '4px 0' }}>✅ View Dashboard</p>
                        <p style={{ margin: '4px 0' }}>✅ View Products</p>
                        <p style={{ margin: '4px 0' }}>✅ View Sales</p>
                        <p style={{ margin: '4px 0' }}>✅ View Anomalies</p>
                    </div>
                    <div>
                        <strong style={{ color: '#111827' }}>📦 Inventory Staff</strong>
                        <p style={{ margin: '4px 0' }}>✅ Record Sales</p>
                        <p style={{ margin: '4px 0' }}>✅ View Products</p>
                        <p style={{ margin: '4px 0' }}>✅ View Anomalies</p>
                        <p style={{ margin: '4px 0' }}>✅ Viewer permissions</p>
                    </div>
                    <div>
                        <strong style={{ color: '#111827' }}>📋 Store Manager</strong>
                        <p style={{ margin: '4px 0' }}>✅ Create/Edit Products</p>
                        <p style={{ margin: '4px 0' }}>✅ Create Anomalies</p>
                        <p style={{ margin: '4px 0' }}>✅ Manage Alerts</p>
                        <p style={{ margin: '4px 0' }}>✅ All Staff permissions</p>
                    </div>
                    <div>
                        <strong style={{ color: '#111827' }}>👑 Admin</strong>
                        <p style={{ margin: '4px 0' }}>✅ Manage Users</p>
                        <p style={{ margin: '4px 0' }}>✅ System Settings</p>
                        <p style={{ margin: '4px 0' }}>✅ Full Access</p>
                        <p style={{ margin: '4px 0' }}>✅ All Manager permissions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}