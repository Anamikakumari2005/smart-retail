import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, open, resolved, ignored

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const res = await axiosInstance.get('/api/alerts/');
            setAlerts(res.data);
            setError('');
        } catch (err) {
            setError('Alerts not loaded!');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (alert_id) => {
        try {
            await axiosInstance.patch(`/api/alerts/${alert_id}/resolve/`);
            loadAlerts();
        } catch (err) {
            setError('Failed to resolve alert!');
        }
    };

    const handleIgnore = async (alert_id) => {
        try {
            await axiosInstance.patch(`/api/alerts/${alert_id}/ignore/`);
            loadAlerts();
        } catch (err) {
            setError('Failed to ignore alert!');
        }
    };

    const handleDelete = async (alert_id) => {
        if (!window.confirm('Delete this alert?')) return;
        try {
            await axiosInstance.delete(`/api/alerts/${alert_id}/`);
            loadAlerts();
        } catch (err) {
            setError('Delete failed!');
        }
    };

    // Filter alerts
    let filtered = alerts.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase())
    );

    if (filterStatus !== 'all') {
        filtered = filtered.filter(a => a.status === filterStatus);
    }

    // Stats
    const openCount = alerts.filter(a => a.status === 'open').length;
    const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
    const ignoredCount = alerts.filter(a => a.status === 'ignored').length;

    const inputStyle = {
        width: '100%', padding: '10px', border: '1px solid #d1d5db',
        borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginTop: '4px'
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'HIGH':
                return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
            case 'MEDIUM':
                return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
            case 'LOW':
                return { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' };
            default:
                return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return { bg: '#fef2f2', text: '#dc2626', badge: '🔴' };
            case 'resolved':
                return { bg: '#f0fdf4', text: '#16a34a', badge: '✅' };
            case 'ignored':
                return { bg: '#f3f4f6', text: '#6b7280', badge: '⏭️' };
            default:
                return { bg: '#f3f4f6', text: '#6b7280', badge: '•' };
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px' }}>Loading...</div>;

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Alerts</h1>
                <p style={{ color: '#6b7280', marginTop: '4px' }}>{alerts.length} total alerts</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #dc2626' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Open Alerts</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626', margin: '8px 0 0 0' }}>{openCount}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #16a34a' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Resolved</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', margin: '8px 0 0 0' }}>{resolvedCount}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #6b7280' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ignored</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#6b7280', margin: '8px 0 0 0' }}>{ignoredCount}</p>
                </div>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Search */}
            <input
                type="text"
                placeholder="Search alerts by title or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: '16px', padding: '12px 16px' }}
            />

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['all', 'open', 'resolved', 'ignored'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: filterStatus === status ? '#3b82f6' : '#f3f4f6',
                            color: filterStatus === status ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '13px',
                            textTransform: 'capitalize'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Alerts List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {filtered.length > 0 ? filtered.map((alert) => {
                    const severityColor = getSeverityColor(alert.severity);
                    const statusColor = getStatusColor(alert.status);

                    return (
                        <div key={alert.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderLeft: `4px solid ${severityColor.text}`,
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '16px',
                            alignItems: 'start'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                        {alert.title}
                                    </h3>
                                    <span style={{
                                        backgroundColor: severityColor.bg,
                                        color: severityColor.text,
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {alert.severity}
                                    </span>
                                    <span style={{
                                        backgroundColor: statusColor.bg,
                                        color: statusColor.text,
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {statusColor.badge} {alert.status}
                                    </span>
                                </div>
                                <p style={{ margin: '8px 0', color: '#6b7280', fontSize: '14px' }}>
                                    {alert.message}
                                </p>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                                    <span>Type: <strong>{alert.anomaly_type}</strong></span>
                                    <span>Created: <strong>{new Date(alert.created_at).toLocaleDateString()}</strong></span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: 'fit-content' }}>
                                {alert.status === 'open' && (
                                    <>
                                        <button onClick={() => handleResolve(alert.id)}
                                            style={{ padding: '8px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                                            ✓ Resolve
                                        </button>
                                        <button onClick={() => handleIgnore(alert.id)}
                                            style={{ padding: '8px 14px', backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                                            ⏭️ Ignore
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(alert.id)}
                                    style={{ padding: '8px 14px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '48px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        color: '#9ca3af'
                    }}>
                        No alerts found
                    </div>
                )}
            </div>
        </div>
    );
}