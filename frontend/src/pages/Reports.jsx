import { useState } from "react";
import axiosInstance from "../api/axios";

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);
    const [reportType, setReportType] = useState('sales');
    const [frequency, setFrequency] = useState('daily');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleDownloadReport = async (type) => {
        setLoading(true);
        setError('');
        
        try {
            let endpoint = '';
            let filename = '';

            switch(type) {
                case 'sales':
                    endpoint = '/api/reports/sales-report?days=30';
                    filename = 'sales_report.pdf';
                    break;
                case 'inventory':
                    endpoint = '/api/reports/inventory-report';
                    filename = 'inventory_report.pdf';
                    break;
                case 'anomalies':
                    endpoint = '/api/reports/anomalies-report';
                    filename = 'anomalies_report.pdf';
                    break;
            }

            const response = await axiosInstance.get(endpoint, { responseType: 'blob' });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            setSuccess('✅ Report downloaded successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to download report');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleReport = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email) {
            setError('Email required!');
            return;
        }

        try {
            const response = await axiosInstance.post('/api/reports/schedule-email-report', {
                report_type: reportType,
                frequency: frequency,
                email: email
            });

            setSuccess(`✅ ${reportType} report scheduled for ${frequency} delivery`);
            setShowSchedule(false);
            setEmail('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to schedule report');
        }
    };

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>📄 Reports</h1>

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

            {/* Quick Download Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Sales Report */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>Sales Report</h3>
                    <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>Last 30 days sales summary</p>
                    <button
                        onClick={() => handleDownloadReport('sales')}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                {/* Inventory Report */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📦</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>Inventory Report</h3>
                    <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>Current stock status</p>
                    <button
                        onClick={() => handleDownloadReport('inventory')}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                {/* Anomalies Report */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>Anomalies Report</h3>
                    <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>Recent anomalies detected</p>
                    <button
                        onClick={() => handleDownloadReport('anomalies')}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            {/* Schedule Reports */}
            <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                    📧 Schedule Reports
                </h2>

                {!showSchedule ? (
                    <button
                        onClick={() => setShowSchedule(true)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        + Schedule New Report
                    </button>
                ) : (
                    <form onSubmit={handleScheduleReport} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '16px'
                    }}>
                        <div>
                            <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="sales">Sales Report</option>
                                <option value="inventory">Inventory Report</option>
                                <option value="anomalies">Anomalies Report</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Frequency</label>
                            <select
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                ✅ Schedule
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSchedule(false)}
                                style={{
                                    padding: '10px 20px',
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
        </div>
    );
}