import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Index.jsx';
import Login from './components/Login/Index.jsx';
import { USER_TYPES } from './constants/userTypes.js';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(USER_TYPES.STUDENT);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // 登录处理函数
    const handleLogin = (type) => {
        setIsAuthenticated(true);
        setUserType(type);
    };

    // 登出处理函数
    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserType(USER_TYPES.STUDENT);
        // 可以在这里清除其他状态或本地存储
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
                                <Sidebar 
                                    userType={userType}
                                    collapsed={sidebarCollapsed}
                                    onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    onLogout={handleLogout}
                                />
                                <div style={{ marginLeft: '250px', padding: '20px', width: 'calc(100% - 250px)' }}>
                                    <Routes>
                                        <Route path="/courses" element={<Courses />} />
                                        <Route path="/checkin" element={<Checkin />} />
                                        <Route path="/students" element={<Students />} />
                                        <Route path="/attandance" element={<Attandance />} />
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
const Courses = () => <h1>Courses Page</h1>;
const Students = () => <h1>Students Page</h1>;
const Checkin = () => <h1>Check In Page</h1>;
const Attandance = () => <h1>Attandance Page</h1>;


function main() {
    const root = createRoot(document.getElementById("app"));
    root.render(<App />);
}

main();

