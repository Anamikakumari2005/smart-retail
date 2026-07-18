import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Anomalies from './pages/Anomalies';
import Alerts from './pages/Alerts';
import Support from './pages/Support';
import CreateAnomaly from './pages/CreateAnomaly';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [darkmode, setDarkmode] = useState(false);

    const toggleDark = () => {
        const newMode = !darkmode;
        setDarkmode(newMode);
        localStorage.setItem('darkmode', newMode);
        document.documentElement.classList.toggle('dark');
    }

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
        const savedDark = localStorage.getItem('darkmode') === 'true';
        setDarkmode(savedDark);
        if (savedDark) document.documentElement.classList.add('dark');
    }, []);

    return (
        <BrowserRouter>
            {isLoggedIn && <Navbar toggleDark={toggleDark} darkMode={darkmode} />}
            <Routes>
                <Route path="/" element={isLoggedIn ? <Dashboard /> : <Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/anomalies" element={<Anomalies />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/support" element={<Support />} />
                <Route path="/create-anomaly" element={<CreateAnomaly />} />
                <Route path="/users" element={<Users />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
            </Routes>
        </BrowserRouter>
    );
}