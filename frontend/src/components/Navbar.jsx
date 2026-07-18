import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Navbar({ toggleDark, darkMode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showMenu, setShowMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        setShowMobileMenu(false);
    };
    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: '📊', roles: ['admin', 'store_manager', 'inventory_staff', 'viewer'] },
        { name: 'Products', path: '/products', icon: '📦', roles: ['admin', 'store_manager', 'inventory_staff', 'viewer'] },
        { name: 'Sales', path: '/sales', icon: '💰', roles: ['admin', 'store_manager', 'inventory_staff'] },
        { name: 'Anomalies', path: '/anomalies', icon: '⚠️', roles: ['admin', 'store_manager', 'inventory_staff', 'viewer'] },
        { name: 'Alerts', path: '/alerts', icon: '🔔', roles: ['admin', 'store_manager'] },
        { name: 'Create Anomaly', path: '/create-anomaly', icon: '⚡', roles: ['admin', 'store_manager'] },
        { name: 'Users', path: '/users', icon: '👥', roles: ['admin'] },
        { name: ' Analytics', path: '/analytics', icon: '⚡', roles: ['admin', 'store_manager'] },
        { name: 'About & Support', path: '/support', icon: 'ℹ️', roles: ['admin', 'store_manager', 'inventory_staff', 'viewer'] },
        { name: 'Reports', path: '/reports', icon: '📄', roles: ['admin', 'store_manager'] },
       
    ];

    const visibleLinks = user ? navLinks.filter(link => link.roles.includes(user.role)) : [];

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return '👑 Admin';
            case 'store_manager': return '📋 Manager';
            case 'inventory_staff': return '📦 Staff';
            case 'viewer': return '👁️ Viewer';
            default: return role;
        }
    };

    return (
        <>
            <nav style={{
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderBottom: '2px solid #e5e7eb',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '70px'
                }}>
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '28px' }}>🛒</span>
                            <span>Smart Retail</span>
                        </div>
                    </Link>

                        {/* <button onClick={toggleDark}>
                {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button> */}

                    {/* Right Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {user && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    marginRight: '8px'
                                }}>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                                        {user.full_name || user.username || 'User'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                                        {getRoleLabel(user.role)}
                                    </p>
                                </div>

                                {/* Avatar */}
                                <div style={{
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                                    onClick={() => setShowMenu(!showMenu)}
                                >
                                    {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                                </div>

                                {/* Dropdown Menu */}
                                {showMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '70px',
                                        right: '0',
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        minWidth: '250px',
                                        zIndex: 1000,
                                        border: '1px solid #e5e7eb'
                                    }}>

                                        <div style={{ padding: '8px 0' }}>
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowMenu(false)}
                                                style={{
                                                    width: '100%',
                                                    display: 'block',
                                                    padding: '12px 16px',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    textDecoration: 'none',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#3b82f6',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                👤 My Profile
                                            </Link>
                                        </div>
                                        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                                            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                                                {user.full_name || user.username}
                                            </p>
                                            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                                                {user.email}
                                            </p>
                                            <p style={{ margin: '4px 0 0 0', color: '#667eea', fontSize: '11px', fontWeight: '600' }}>
                                                {getRoleLabel(user.role)}
                                            </p>
                                        </div>

                                        <div style={{ padding: '8px 0', borderTop: '1px solid #e5e7eb' }}>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setShowMenu(false);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#dc2626',
                                                    fontWeight: '500'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                🚪 Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ✅ HAMBURGER MENU */}
                        {isLoggedIn && (
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px'
                                }}
                            >
                                <div style={{ width: '24px', height: '3px', backgroundColor: '#667eea' }}></div>
                                <div style={{ width: '24px', height: '3px', backgroundColor: '#667eea' }}></div>
                                <div style={{ width: '24px', height: '3px', backgroundColor: '#667eea' }}></div>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* ✅ SMALL SIDEBAR - Side से आएगा */}
            {showMobileMenu && isLoggedIn && (
                <>
                    {/* Dark Overlay */}
                    <div
                        onClick={() => setShowMobileMenu(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            zIndex: 200,
                            backdropFilter: 'blur(2px)'
                        }}
                    ></div>

                    {/* Compact Sidebar - Left से आएगा */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '280px',
                        height: '100vh',
                        backgroundColor: 'white',
                        zIndex: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                        animation: 'slideInLeft 0.3s ease-out'
                    }}>
                        <style>{`
                            @keyframes slideInLeft {
                                from {
                                    transform: translateX(-100%);
                                }
                                to {
                                    transform: translateX(0);
                                }
                            }
                        `}</style>

                        {/* Header with Close */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                Menu
                            </h3>
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#667eea'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div style={{
                            flex: 1,
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            overflowY: 'auto'
                        }}>
                            {visibleLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: isActive(link.path) ? 'white' : '#374151',
                                        backgroundColor: isActive(link.path) ? '#667eea' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        if (!isActive(link.path)) {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (!isActive(link.path)) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>{link.icon}</span>
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Logout Button */}
                        <div style={{
                            padding: '12px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );

}