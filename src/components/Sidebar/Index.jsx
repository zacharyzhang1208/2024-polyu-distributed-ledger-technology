import React from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_TYPES } from '../../constants/userTypes';
import '../../css/Sidebar.css';

const Sidebar = ({ userType = USER_TYPES.STUDENT, collapsed, onCollapse }) => {
    const navigate = useNavigate();
    
    // 根据用户类型获取侧边栏菜单项
    const getMenuItems = () => {
        const menuItems = {
            [USER_TYPES.STUDENT]: [
                { path: '/checkin', icon: 'fas fa-home', label: 'Check In' },
            ],
            [USER_TYPES.TEACHER]: [
                { path: '/attandance', icon: 'fas fa-home', label: 'Attandance' },
                { path: '/courses', icon: 'fas fa-chalkboard-teacher', label: 'Teaching Courses' },
            ]
        };

        return menuItems[userType];
    };

    const menuItems = getMenuItems();

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
                        <li key={index}>
                            <a onClick={() => navigate(item.path)}>
                                <i className={item.icon}></i>
                                {!collapsed && <span>{item.label}</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 