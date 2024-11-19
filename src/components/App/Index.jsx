import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Login from '../Login/Index';
import { USER_TYPES } from '../../constants/userTypes';
import '../../css/App.css';

// 临时页面组件
const Dashboard = () => <h1>Dashboard Page</h1>;
const Profile = () => <h1>Profile Page</h1>;
const Courses = () => <h1>Courses Page</h1>;
const Schedule = () => <h1>Schedule Page</h1>;
const Settings = () => <h1>Settings Page</h1>;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(USER_TYPES.STUDENT);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // 登录处理函数
    const handleLogin = (type) => {
        setIsAuthenticated(true);
        setUserType(type);
    };

    // 处理侧边栏折叠
    const handleSidebarCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route
                    path="/*"
                    element={
                        isAuthenticated ? (
                            <div className="app-container">
                                <Sidebar 
                                    userType={userType}
                                    collapsed={sidebarCollapsed}
                                    onCollapse={handleSidebarCollapse}
                                />
                                <div className={`main-content ${sidebarCollapsed ? 'content-expanded' : ''}`}>
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
};

export default App; 