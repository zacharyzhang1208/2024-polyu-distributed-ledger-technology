import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_TYPES, DEFAULT_ROUTES } from '../../constants/userTypes';
import '../../css/Login.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    userType: USER_TYPES.STUDENT
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // 清除错误信息
    setError('');
  };

  // 模拟的用户数据
  const mockUsers = {
    students: [
      { id: '2024001', password: '123456' },
      { id: '2024002', password: '123456' }
    ],
    teachers: [
      { id: 'teacher001', password: '123456' },
      { id: 'teacher002', password: '123456' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // 模拟登录验证
      const { username, password, userType } = formData;
      
      // 根据用户类型选择验证数据
      const users = userType === USER_TYPES.STUDENT ? mockUsers.students : mockUsers.teachers;
      
      // 查找用户
      const user = users.find(u => u.id === username && u.password === password);
      
      if (user) {
        // 登录成功
        console.log('Login successful:', username);
        
        // 存储用户信息到 localStorage
        localStorage.setItem('user', JSON.stringify({
          id: username,
          type: userType
        }));
        
        // 调用父组件的登录回调
        onLogin(userType);
        
        // 根据用户类型跳转到对应的首页路由
        const defaultRoute = DEFAULT_ROUTES[userType];
        navigate(defaultRoute);
      } else {
        // 登录失败
        setError('Invalid username or password');
      }
    } else {
      // 注册逻辑保持不变
      // ... 原有的注册代码 ...
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="user-type-select"
            >
              <option value={USER_TYPES.STUDENT}>Student</option>
              <option value={USER_TYPES.TEACHER}>Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder={formData.userType === USER_TYPES.STUDENT ? "Student ID" : "Teacher ID"}
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="e-mail"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="switch-form">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login; 