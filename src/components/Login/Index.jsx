import React, { useState } from 'react';
import '../../css/Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // 处理登录逻辑
      console.log('登录信息:', formData);
    } else {
      // 处理注册逻辑
      console.log('注册信息:', formData);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? '登录' : '注册'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="用户名"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="电子邮箱"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        <p className="switch-form">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '立即注册' : '立即登录'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login; 