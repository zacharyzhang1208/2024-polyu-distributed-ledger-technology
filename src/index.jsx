import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Index.jsx';
import Login from './components/Login/Index.jsx';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 登录处理函数
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route
                    path="/*"
                    element={
                        isAuthenticated ? (
                            <div style={{ display: 'flex' }}>
                                <Sidebar />
                                <div className="main-content">
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/courses" element={<Courses />} />
                                        <Route path="/schedule" element={<Schedule />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </div>
                            </div>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

// 临时的页面组件
const Dashboard = () => <h1>Dashboard Page</h1>;
const Profile = () => <h1>Profile Page</h1>;
const Courses = () => <h1>Courses Page</h1>;
const Schedule = () => <h1>Schedule Page</h1>;
const Settings = () => <h1>Settings Page</h1>;

function main() {
    const root = createRoot(document.getElementById("app"));
    root.render(<App />);
}

main();

