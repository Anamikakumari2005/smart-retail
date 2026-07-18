import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function Signup() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('inventory_staff')
const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await axiosInstance.post('/api/auth/register', {
                username: username,
                email: email,
                password: password,
                role: role
            })

            // Token store karo
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            navigate('/')
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Signup failed')
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
            <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Sign Up</h1>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    {/* Username */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#111827' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#111827' }}>Email</label>
    <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
        placeholder="you@example.com"
        required
    />
</div>

                    {/* Password */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#111827' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Role */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#111827' }}>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                        >
                            <option value="inventory_staff">Inventory Staff</option>
                            <option value="store_manager">Store Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: loading ? '#9ca3af' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
                    Already have an account? <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Login</a>
                </p>
            </div>
        </div>
    )
}