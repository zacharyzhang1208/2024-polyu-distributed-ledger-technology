import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_TYPES, DEFAULT_ROUTES } from '../../constants/userTypes';
import '../../css/Login.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const { username, password, userType } = formData;
        const users = userType === USER_TYPES.STUDENT ? mockUsers.students : mockUsers.teachers;
        const user = users.find(u => u.id === username && u.password === password);
        
        if (user) {
          console.log('Login successful:', username);
          localStorage.setItem('user', JSON.stringify({
            id: username,
            type: userType
          }));
          onLogin(userType);
          navigate(DEFAULT_ROUTES[userType]);
        } else {
          setError('Invalid username or password');
        }
      } catch (error) {
        setError('Login failed. Please try again.');
      } finally {
        setIsLoading(false);
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

          <button 
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <p className="switch-form">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => !isLoading && setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login; 