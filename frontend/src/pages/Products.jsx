import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ ProductID: '', name: '', category: '', brand: '', price: '', stock: '' });

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            const res = await axiosInstance.get('/api/products/');
            setProducts(res.data);
            setError('');
        } catch (err) {
            setError('Products not loaded yet!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editProduct) {
                await axiosInstance.put(`/api/products/${editProduct.product_id}/`, {
                    product_id: form.ProductID,
                    name: form.name,
                    category: form.category,
                    brand: form.brand,
                    price: parseFloat(form.price) || 0,
                    stock: parseInt(form.stock) || 0
                });
            } else {
                await axiosInstance.post('/api/products/', {
                    product_id: form.ProductID,
                    name: form.name,
                    category: form.category,
                    brand: form.brand,
                    price: parseFloat(form.price) || 0,
                    stock: parseInt(form.stock) || 0
                });
            }
            setShowForm(false);
            setEditProduct(null);
            setForm({ ProductID: '', name: '', category: '', brand: '', price: '', stock: '' });
            loadProducts();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Error!';
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setForm({ 
            ProductID: product.product_id || '', 
            name: product.name || '', 
            category: product.category || '', 
            brand: product.brand || '', 
            price: product.price || '', 
            stock: product.stock || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (product_id) => {
        if (!window.confirm('want to Delete?')) return;
        try {
            await axiosInstance.delete(`/api/products/${product_id}/`);
            loadProducts();
        } catch (err) {
            setError('Delete failed!');
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );

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
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Products</h1>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>{products.length} products total</p>
                </div>
                <button
                    onClick={() => { 
                        setShowForm(true); 
                        setEditProduct(null); 
                        setForm({ ProductID: '', name: '', category: '', brand: '', price: '', stock: '' });  // ✅ FIX
                    }}
                    style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                    + Add Product
                </button>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Search */}
            <input
                type="text"
                placeholder="Search by name, category, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: '24px', padding: '12px 16px' }}
            />

            {/* Modal Form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '440px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                            {editProduct ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {[
                                { label: 'Product ID', key: 'ProductID', type: 'text', placeholder: 'P001' },
                                { label: 'Product Name', key: 'name', type: 'text', placeholder: 'Basmati Rice' },
                                { label: 'Category', key: 'category', type: 'text', placeholder: 'Grocery' },
                                { label: 'Brand', key: 'brand', type: 'text', placeholder: 'India Gate' },
                                { label: 'Price (₹)', key: 'price', type: 'number', placeholder: '120' },
                                { label: 'Stock', key: 'stock', type: 'number', placeholder: '100' },
                            ].map(field => (
                                <div key={field.key} style={{ marginBottom: '16px' }}>
                                    <label style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={form[field.key]}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                    {editProduct ? 'Update' : 'Add'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setEditProduct(null); }}
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
                            {['Product ID', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map((p, i) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>{p.product_id}</td>
                                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>{p.name}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}>{p.category}</span>
                                </td>
                                <td style={{ padding: '14px 16px', color: '#374151' }}>{p.brand}</td>
                                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#059669' }}>₹{p.price}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span style={{ color: p.stock < 50 ? '#dc2626' : '#111827', fontWeight: p.stock < 50 ? '700' : '400' }}>
                                        {p.stock} {p.stock < 50 && '⚠️'}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleEdit(p)}
                                            style={{ padding: '6px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(p.product_id)}
                                            style={{ padding: '6px 14px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No products found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}