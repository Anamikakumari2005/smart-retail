import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ product_id: '', quantity: '', sale_date: new Date().toISOString().split('T')[0] });

    useEffect(() => { 
        loadSales();
        loadProducts();
    }, []);

    const loadSales = async () => {
        try {
            const res = await axiosInstance.get('/api/sales/');
            setSales(res.data);
            setError('');
        } catch (err) {
            setError('Sales not loaded!');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const res = await axiosInstance.get('/api/products/');
            setProducts(res.data);
        } catch (err) {
            console.error('Products load error:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.post('/api/sales/', {
                product_id: form.product_id,
                quantity: parseInt(form.quantity),
                // sale_date: form.sale_date
            });
            setShowForm(false);
            setForm({ product_id: '', quantity: '' });
            loadSales();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Error!';
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const handleDelete = async (sale_id) => {
        if (!window.confirm('Delete this sale?')) return;
        try {
            await axiosInstance.delete(`/api/sales/${sale_id}/`);
            loadSales();
        } catch (err) {
            setError('Delete failed!');
        }
    };

    const filtered = sales.filter(s =>
        s.product_id.toLowerCase().includes(search.toLowerCase())
    );

    const totalSales = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalQuantity = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);

    const inputStyle = {
        width: '100%', padding: '10px', border: '1px solid #d1d5db',
        borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginTop: '4px'
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '48px', fontSize: '18px' }}>Loading...</div>;

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Sales</h1>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>{sales.length} sales records</p>
                </div>
                <button
                    onClick={() => { 
                        setShowForm(true); 
                        setForm({ product_id: '', quantity: '', sale_date: new Date().toISOString().split('T')[0] });
                    }}
                    style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                    + Add Sale
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Total Sales Amount</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669', margin: '8px 0 0 0' }}>₹{totalSales.toLocaleString()}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Total Quantity Sold</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', margin: '8px 0 0 0' }}>{totalQuantity} units</p>
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
                placeholder="Search by product ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: '24px', padding: '12px 16px' }}
            />

            {/* Modal Form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '440px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Record Sale</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>Product</label>
                                <select
                                    value={form.product_id}
                                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                    style={{ ...inputStyle }}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.product_id}>
                                            {p.product_id} - {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>Quantity</label>
                                <input
                                    type="number"
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                    placeholder="10"
                                    style={inputStyle}
                                    required
                                    min="1"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>Sale Date</label>
                                <input
                                    type="date"
                                    value={form.sale_date}
                                    onChange={(e) => setForm({ ...form, sale_date: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                    Record Sale
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            {['Sale ID', 'Product ID', 'Quantity', 'Amount', 'Date', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((s, i) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{s.id}</td>
                                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>{s.product_id}</td>
                                <td style={{ padding: '14px 16px', color: '#374151' }}>{s.quantity} units</td>
                                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#059669' }}>₹{s.amount?.toLocaleString() || 'N/A'}</td>
                                <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '13px' }}>
                                    {new Date(s.sale_date).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <button onClick={() => handleDelete(s.id)}
                                        style={{ padding: '6px 14px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No sales found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}