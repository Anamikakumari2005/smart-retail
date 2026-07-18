import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export default function Anomalies() {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadAnomalies();
    }, []);

    // ✅ Filter object बना
    const buildFilters = () => {
        return {
            severity: filterSeverity !== 'all' ? filterSeverity : undefined,
            anomaly_type: filterType !== 'all' ? filterType : undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined
        };
    };

    // ✅ API call के साथ filters भेजो
    const loadAnomalies = async () => {
        try {
            setLoading(true);
            const filters = buildFilters();
            const res = await axiosInstance.get('/api/anomalies/', { params: filters });
            setAnomalies(res.data);
            setError('');
        } catch (err) {
            setError('Anomalies not loaded!');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Filter apply करो
    const applyFilter = () => {
        loadAnomalies();
    };

    // ✅ Reset filters
    const resetFilters = () => {
        setFromDate("");
        setToDate("");
        setFilterSeverity("all");
        setFilterType("all");
        setSearch("");
        loadAnomalies();
    };

    // ✅ Delete anomaly
    const handleDelete = async (anomaly_id) => {
        if (!window.confirm('Delete this anomaly?')) return;
        try {
            await axiosInstance.delete(`/api/anomalies/${anomaly_id}/`);
            loadAnomalies();
        } catch (err) {
            setError('Delete failed!');
        }
    };

    // ✅ Frontend filter - search के लिए
    let filtered = anomalies.filter(a =>
        a.product_id.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
    );

    // Get unique types
    const anomalyTypes = [...new Set(anomalies.map(a => a.anomaly_type))];

    // Stats
    const highSeverity = anomalies.filter(a => a.severity === 'HIGH').length;
    const mediumSeverity = anomalies.filter(a => a.severity === 'MEDIUM').length;
    const lowSeverity = anomalies.filter(a => a.severity === 'LOW').length;

    
    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginTop: '4px'
    };

    const getSeverityStyle = (severity) => {
        switch (severity?.toUpperCase()) {
            case 'HIGH':
                return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', icon: '🔴' };
            case 'MEDIUM':
                return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d', icon: '🟡' };
            case 'LOW':
                return { bg: '#f0fdf4', text: '#16a34a', border: '#86efac', icon: '🟢' };
            default:
                return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', icon: '⚪' };
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px' }}>Loading...</div>;

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Anomalies</h1>
                <p style={{ color: '#6b7280', marginTop: '4px' }}>{anomalies.length} total anomalies detected</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #dc2626' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>🔴 High Severity</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626', margin: '8px 0 0 0' }}>{highSeverity}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #d97706' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>🟡 Medium Severity</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706', margin: '8px 0 0 0' }}>{mediumSeverity}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #16a34a' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>🟢 Low Severity</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', margin: '8px 0 0 0' }}>{lowSeverity}</p>
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
                placeholder="Search by product ID or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: '16px', padding: '12px 16px' }}
            />

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                    <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '8px' }}>From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '8px' }}>To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        style={inputStyle}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                    <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Severity</label>
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="all">All Severities</option>
                        <option value="HIGH">🔴 High</option>
                        <option value="MEDIUM">🟡 Medium</option>
                        <option value="LOW">🟢 Low</option>
                    </select>
                </div>

                <div>
                    <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Type</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="all">All Types</option>
                        {anomalyTypes.map(type => (
                            <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button
                    onClick={applyFilter}
                    style={{
                        padding: '10px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    🔍 Apply Filters
                </button>

                <button
                    onClick={resetFilters}
                    style={{
                        padding: '10px 24px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    🔄 Reset Filters
                </button>
            </div>

            {/* Anomalies List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {filtered.length > 0 ? filtered.map((anomaly) => {
                    const severityStyle = getSeverityStyle(anomaly.severity);
                    const deviation = ((anomaly.value - anomaly.expected_value) / anomaly.expected_value * 100).toFixed(1);

                    return (
                        <div key={anomaly.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderLeft: `4px solid ${severityStyle.text}`,
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '16px',
                            alignItems: 'start'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                        {anomaly.product_id}
                                    </h3>
                                    <span style={{
                                        backgroundColor: severityStyle.bg,
                                        color: severityStyle.text,
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {severityStyle.icon} {anomaly.severity}
                                    </span>
                                    <span style={{
                                        backgroundColor: '#eff6ff',
                                        color: '#3b82f6',
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {anomaly.anomaly_type.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <p style={{ margin: '8px 0', color: '#6b7280', fontSize: '14px' }}>
                                    {anomaly.description}
                                </p>

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '12px' }}>
                                    <div>
                                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 4px 0' }}>Expected Value</p>
                                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                                            {anomaly.expected_value?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 4px 0' }}>Actual Value</p>
                                        <p style={{ fontSize: '16px', fontWeight: '600', color: severityStyle.text, margin: 0 }}>
                                            {anomaly.value?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 4px 0' }}>Deviation</p>
                                        <p style={{ fontSize: '16px', fontWeight: '600', color: severityStyle.text, margin: 0 }}>
                                            {deviation > 0 ? '+' : ''}{deviation}%
                                        </p>
                                    </div>
                                </div>

                                <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                                    Detected: {new Date(anomaly.created_at).toLocaleDateString()} at {new Date(anomaly.created_at).toLocaleTimeString()}
                                </p>
                            </div>

                            <button
                                onClick={() => handleDelete(anomaly.id)}
                                style={{
                                    padding: '8px 14px',
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                🗑️ Delete
                            </button>
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
                        No anomalies found
                    </div>
                )}
            </div>
        </div>
    );
}