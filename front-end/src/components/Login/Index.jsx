import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_TYPES, DEFAULT_ROUTES } from '../../constants/userTypes';
import { checkStudentRegistration, registerStudent, registerTeacher } from '../../services/api';
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { username, password, userType } = formData;

      if (isLogin) {
        // 登录逻辑
        if (userType === USER_TYPES.STUDENT) {
          const { exists, message } = await checkStudentRegistration(username);
          if (!exists) {
            setError(message || '该学生尚未注册，请先注册');
            setIsLoading(false);
            return;
          }
        } else {
          const { exists, message } = await checkTeacherRegistration(username);
          if (!exists) {
            setError(message || '该教师尚未注册，请先注册');
            setIsLoading(false);
            return;
          }
        }
        
        // TODO: 实现登录验证
        localStorage.setItem('user', JSON.stringify({
          id: username,
          type: userType
        }));
        onLogin(userType);
        navigate(DEFAULT_ROUTES[userType]);
      } else {
        // 注册逻辑
        if (userType === USER_TYPES.STUDENT) {
          const { exists, message } = await checkStudentRegistration(username);
          if (exists) {
            setError(message || '该学生已注册');
            setIsLoading(false);
            return;
          }
          await registerStudent(formData);
        } else {
          const { exists, allowed, message } = await checkTeacherRegistration(username);
          if (exists) {
            setError(message || '该教师已注册');
            setIsLoading(false);
            return;
          }
          if (!allowed) {
            setError(message || '该教师ID不在允许注册列表中');
            setIsLoading(false);
            return;
          }
          await registerTeacher(formData);
        }
        
        setError('注册成功！请登录');
        setIsLogin(true);
      }
    } catch (error) {
      setError(error.message || (isLogin ? '登录失败' : '注册失败'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? '登录' : '注册'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="user-type-select"
            >
              <option value={USER_TYPES.STUDENT}>学生</option>
              <option value={USER_TYPES.TEACHER}>教师</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder={formData.userType === USER_TYPES.STUDENT ? "学号" : "教师工号"}
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="邮箱"
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

          <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>{isLogin ? '登录中...' : '注册中...'}</span>
              </div>
            ) : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <p className="switch-form">
          {isLogin ? "还没有账号?" : "已有账号?"}
          <span onClick={() => !isLoading && setIsLogin(!isLogin)}>
            {isLogin ? '注册' : '登录'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login; 