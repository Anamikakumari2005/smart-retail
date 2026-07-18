import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
    const response = await axiosInstance.post('api/auth/login', {
        username: username,
        password: password
    });

    console.log(response.data);   // 👈 Ye add karo

    localStorage.setItem('token', response.data.access_token);

    if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
        localStorage.removeItem('user');
    }

    navigate('/');
} catch (err) {
    setError(err.response?.data?.detail || 'Login failed');
} finally {
    setLoading(false);
}
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            animation: 'fadeIn 0.6s ease-in'
        }}>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                input:focus {
                    outline: none;
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .card {
                    animation: slideUp 0.8s ease-out;
                }

                .logo {
                    animation: slideUp 0.6s ease-out;
                }

                .form-input {
                    transition: all 0.3s ease;
                }

                .error-box {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>

            {/* Decorative circles */}
            <div style={{
                position: 'fixed',
                top: '-50px',
                right: '-50px',
                width: '300px',
                height: '300px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'fixed',
                bottom: '-80px',
                left: '-80px',
                width: '400px',
                height: '400px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                zIndex: 0
            }}></div>

            <div className="card" style={{
                backgroundColor: 'white',
                padding: '48px 40px',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                width: '100%',
                maxWidth: '420px',
                zIndex: 1,
                position: 'relative'
            }}>
                {/* Logo/Title */}
                <div className="logo" style={{
                    textAlign: 'center',
                    marginBottom: '36px'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px'
                    }}>🛒</div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 0 8px 0'
                    }}>Smart Retail</h1>
                    <p style={{
                        color: '#9ca3af',
                        fontSize: '14px',
                        margin: 0
                    }}>Welcome back, Madam Ji!</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-box" style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#111827',
                            fontSize: '14px'
                        }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                backgroundColor: '#f9fafb'
                            }}
                            placeholder="admin@test.com"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            color: '#111827',
                            fontSize: '14px'
                        }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                backgroundColor: '#f9fafb'
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px 16px',
                            background: loading
                                ? 'linear-gradient(135deg, #cbd5e1 0%, #a1aec9 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: loading ? 0.8 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    display: 'inline-block',
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }}></span>
                                Logging in...
                            </>
                        ) : (
                            <>Sign In Now</>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '24px 0',
                    color: '#d1d5db'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                    <span style={{ fontSize: '13px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                </div>

                {/* Demo Credentials */}
                <div style={{
                    backgroundColor: '#f0f4ff',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #dbeafe',
                    marginBottom: '20px'
                }}>
                    <p style={{
                        margin: '0 0 8px 0',
                        color: '#667eea',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>Demo Credentials:</p>
                    <p style={{
                        margin: '4px 0',
                        color: '#4f46e5',
                        fontSize: '13px',
                        fontFamily: 'monospace'
                    }}>📧 admin@test.com</p>
                    <p style={{
                        margin: '4px 0',
                        color: '#4f46e5',
                        fontSize: '13px',
                        fontFamily: 'monospace'
                    }}>🔐 admin123</p>
                </div>

                {/* Sign Up Link */}
                <p style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0
                }}>
                    Don't have an account?{' '}
                    <a href="/signup" style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'color 0.3s ease'
                    }} onMouseOver={(e) => e.target.style.color = '#764ba2'} onMouseOut={(e) => e.target.style.color = '#667eea'}>
                        Create Account
                    </a>
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}