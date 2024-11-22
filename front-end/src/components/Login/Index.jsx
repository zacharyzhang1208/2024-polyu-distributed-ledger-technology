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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      // 处理登录逻辑
      console.log('login info:', formData);
      
      // 调用父组件的登录回调
      onLogin(formData.userType);
      
      // 根据用户类型跳转到对应的首页路由
      const defaultRoute = DEFAULT_ROUTES[formData.userType];
      navigate(defaultRoute);
    } else {
      // 处理注册逻辑
      console.log('register info:', formData);
      
      try {
        const response = await fetch('http://localhost:3001/operator/wallets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response from backend:', data);
        
        // 注册成功后可以添加其他逻辑
        // 例如显示成功消息或自动切换到登录页面
        alert('Registration successful!');
        setIsLogin(true);
      } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed: ' + error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
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
              placeholder="student id"
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