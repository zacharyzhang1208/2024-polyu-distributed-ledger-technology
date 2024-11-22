import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { USER_TYPES } from '../../constants/userTypes';
import Login from '../Login/Index.jsx';
import Sidebar from '../Sidebar/Index.jsx';
import Courses from '../Courses/Index.jsx';
import Students from '../Students/Index.jsx';

const Checkin = () => <h1>Check In Page</h1>;
const Attandance = () => <h1>Attandance Page</h1>;

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
                                <div style={{ 
                                    marginLeft: sidebarCollapsed ? '70px' : '250px', 
                                    width: sidebarCollapsed ? 'calc(100% - 70px)' : 'calc(100% - 250px)'
                                }}>
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

export default App;