import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { USER_TYPES, USER_ROUTES } from '../../constants/userTypes';
import '../../css/Sidebar.css';

const Sidebar = ({ userType = USER_TYPES.STUDENT, collapsed, onCollapse, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const getMenuItems = () => {
        return USER_ROUTES[userType] || USER_ROUTES[USER_TYPES.STUDENT];
    };

    const menuItems = getMenuItems();

    const isActive = (path) => {
        return location.pathname === path;
    };

    // 处理登出
    const handleLogout = () => {
        // 调用父组件传入的登出函数
        onLogout();
        // 导航到登录页
        navigate('/login');
    };

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h3>{collapsed ? 'LMS' : 'Learning Management'}</h3>
                <button 
                    className="collapse-btn"
                    onClick={onCollapse}
                >
                    {collapsed ? '>' : '<'}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index} className={isActive(item.path) ? 'active' : ''}>
                            <a onClick={() => navigate(item.path)}>
                                <i className={`${item.icon} ${isActive(item.path) ? 'active' : ''}`}></i>
                                {!collapsed && <span className={isActive(item.path) ? 'active' : ''}>{item.label}</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button 
                    className="logout-btn"
                    onClick={handleLogout}  // 绑定登出处理函数
                    title={collapsed ? 'Logout' : ''}  // 折叠时显示提示
                >
                    <i className="fas fa-sign-out-alt"></i>
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 