import { useState } from "react";
import axiosInstance from "../api/axios";

export default function CreateAnomaly() {
    const [form, setForm] = useState({
        product_id: '',
        anomaly_type: 'sales_spike',
        severity: 'HIGH',
        expected_value: '',
        value: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // ✅ Backend को POST request
            await axiosInstance.post('/api/anomalies/', {
                product_id: form.product_id,
                anomaly_type: form.anomaly_type,
                severity: form.severity,
                expected_value: parseFloat(form.expected_value),
                value: parseFloat(form.value),
                description: form.description
            });

            setSuccess(true);
            setForm({
                product_id: '',
                anomaly_type: 'sales_spike',
                severity: 'HIGH',
                expected_value: '',
                value: '',
                description: ''
            });
            
            // 3 seconds बाद message hide कर
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
    console.log(err.response?.data);

    if (Array.isArray(err.response?.data?.detail)) {
        setError(
            err.response.data.detail
                .map((e) => e.msg)
                .join(", ")
        );
    } else {
        setError(err.response?.data?.detail || "Error creating anomaly!");
    }

} finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginTop: '8px'
    };

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Create Anomaly (Admin Only)</h1>

                {success && (
                    <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                        ✅ Anomaly created! Manager notified via Email/WhatsApp/Call
                    </div>
                )}

                {error && (
    <div
        style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px",
            whiteSpace: "pre-line"
        }}
    >
        ❌ {error}
    </div>
)}

                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: '500', color: '#374151' }}>Product ID</label>
                            <input
                                type="text"
                                value={form.product_id}
                                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                placeholder="P001"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: '500', color: '#374151' }}>Anomaly Type</label>
                            <select
                                value={form.anomaly_type}
                                onChange={(e) => setForm({ ...form, anomaly_type: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="sales_spike">Sales Spike</option>
                                <option value="sales_drop">Sales Drop</option>
                                <option value="dead_stock">Dead Stock</option>
                                <option value="price_anomaly">Price Anomaly</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: '500', color: '#374151' }}>Severity</label>
                            <select
                                value={form.severity}
                                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="LOW">🟢 Low</option>
                                <option value="MEDIUM">🟡 Medium</option>
                                <option value="HIGH">🔴 High</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: '500', color: '#374151' }}>Expected Value</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.expected_value}
                                onChange={(e) => setForm({ ...form, expected_value: e.target.value })}
                                placeholder="21.5"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: '500', color: '#374151' }}>Actual Value</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                placeholder="200"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontWeight: '500', color: '#374151' }}>Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the anomaly..."
                                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: loading ? '#9ca3af' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            {loading ? 'Creating & Notifying...' : 'Create Anomaly'}
                        </button>
                    </form>
                </div>

                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        <strong>📬 When you submit:</strong><br/>
                        ✅ Anomaly save होगा<br/>
                        ✅ Manager को Email भेजेगा<br/>
                        ✅ Manager को WhatsApp भेजेगा<br/>
                        ✅ HIGH severity हो तो Call भी करेगा
                    </p>
                </div>
            </div>
        </div>
    );
}