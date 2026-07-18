import { useState } from "react";
import axiosInstance from "../api/axios";

export default function SupportAbout() {
    const [activeTab, setActiveTab] = useState('about'); // about या support
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        product_id: '',
        customer_email: ''
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
            await axiosInstance.post('/api/support/ticket/', formData);
            setSuccess(true);
            setFormData({ subject: '', message: '', product_id: '', customer_email: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error submitting ticket!');
        } finally {
            setLoading(false);
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

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>About & Support</h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
                    <button
                        onClick={() => setActiveTab('about')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'about' ? '#3b82f6' : 'transparent',
                            color: activeTab === 'about' ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px',
                            borderBottom: activeTab === 'about' ? '3px solid #3b82f6' : 'none'
                        }}
                    >
                        ℹ️ About
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'support' ? '#3b82f6' : 'transparent',
                            color: activeTab === 'support' ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '8px 8px 0 0',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px',
                            borderBottom: activeTab === 'support' ? '3px solid #3b82f6' : 'none'
                        }}
                    >
                        🎫 Support
                    </button>
                </div>

                {/* ABOUT TAB */}
                {activeTab === 'about' && (
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>About Smart Retail</h2>

                        <div style={{ lineHeight: '1.8', color: '#374151', fontSize: '16px' }}>
                            <p>
                                <strong>Smart Retail Inventory Anomaly Detection System</strong> एक advanced platform है जो retail stores के लिए designed है।
                            </p>

                            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: '600' }}>🎯 हमारा Mission:</h3>
                            <p>
                                Retail businesses को real-time inventory anomalies detect करने में मदद करना, जिससे wastage कम हो और profits बढ़ें।
                            </p>

                            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: '600' }}>✨ Features:</h3>
                            <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                                <li>📊 Real-time Dashboard analytics</li>
                                <li>🔍 Advanced anomaly detection using ML</li>
                                <li>📦 Complete inventory management</li>
                                <li>🔔 Instant alerts via Email/WhatsApp</li>
                                <li>📈 Sales analytics & trends</li>
                                <li>👥 Multi-user support with roles</li>
                            </ul>

                            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: '600' }}>📞 Contact Info:</h3>
                            <p>
                                📧 Email: <strong>support@smartretail.com</strong><br/>
                                📱 Phone: <strong>+91-9876543210</strong><br/>
                                🌐 Website: <strong>www.smartretail.com</strong>
                            </p>

                            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: '600' }}>👥 Team:</h3>
                            <p>
                                हमारी experienced team retail industry में 10+ years का experience रखता है।
                            </p>

                            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontWeight: '600' }}>🏢 Company Info:</h3>
                            <p>
                                <strong>Ardent Computech Pvt. Ltd.</strong><br/>
                                Registered Office: Bangalore, India<br/>
                                Founded: 2020
                            </p>
                        </div>
                    </div>
                )}

                {/* SUPPORT TAB */}
                {activeTab === 'support' && (
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Submit Support Ticket</h2>

                        {success && (
                            <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                ✅ Ticket submitted! We'll contact you within 24 hours.
                            </div>
                        )}

                        {error && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                ❌ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>Email</label>
                                <input
                                    type="email"
                                    value={formData.customer_email}
                                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                    placeholder="your-email@example.com"
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>Product ID (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    placeholder="P001"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g., Product defective"
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    style={{ ...inputStyle, height: '200px', resize: 'vertical' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}