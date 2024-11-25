import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { USER_TYPES } from '../../constants/userTypes';
import Login from '../Login/Index.jsx';
import Sidebar from '../common/Sidebar/Index.jsx';
import TeacherCourses from '../TeacherCourses/Index';
import StudentCourses from '../StudentCourses/Index';
import Wallet from '../Wallet/Index.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../../css/App.css'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(USER_TYPES.STUDENT);

    const handleLogin = (type) => {
        setIsAuthenticated(true);
        setUserType(type);
    };

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
                                    onLogout={handleLogout}
                                />
                                <div style={{ 
                                    marginLeft:'250px', 
                                    width: 'calc(100% - 250px)'
                                }}>
                                    <Routes>
                                        <Route path="/student_courses" element={<StudentCourses />} />
                                        <Route path="/teacher_courses" element={<TeacherCourses />} />
                                        <Route path="/wallet" element={<Wallet user/>} />
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