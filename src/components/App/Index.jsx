import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Login from '../Login/Index.jsx';
import { USER_TYPES } from '../../constants/userTypes';
import '../../css/App.css';

// 临时页面组件
const Checkin = () => <h1>Check In Page</h1>;
const Courses = () => <h1>Courses Page</h1>;
const Students = () => <h1>Students Page</h1>;
const Attandance = () => <h1>Attandance Page</h1>;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(USER_TYPES.STUDENT);

    // 登录处理函数
    const handleLogin = (type) => {
        setIsAuthenticated(true);
        setUserType(type);
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
                                <Sidebar userType={userType} />
                                <div className={`main-content ${sidebarCollapsed ? 'content-expanded' : ''}`}>
                                    <Routes>
                                        <Route path="/checkin" element={<Checkin />} />
                                        <Route path="/courses" element={<Courses />} />
                                        <Route path="/attandance" element={<Attandance />} />
                                        <Route path="/students" element={<Students />} />
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