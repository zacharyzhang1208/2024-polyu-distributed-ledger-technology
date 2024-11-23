import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_TYPES, DEFAULT_ROUTES } from '../../constants/userTypes';
import { checkStudentRegistration, checkTeacherRegistration, registerStudent, registerTeacher } from '../../services/api';
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
        // Login logic
        if (userType === USER_TYPES.STUDENT) {
          const { exists, message } = await checkStudentRegistration(username);
          if (!exists) {
            setError(message || 'Student not registered. Please register first.');
            setIsLoading(false);
            return;
          }
        } else {
          const { exists, message } = await checkTeacherRegistration(username);
          if (!exists) {
            setError(message || 'Teacher not registered. Please register first.');
            setIsLoading(false);
            return;
          }
        }
        
        // TODO: Implement login verification
        localStorage.setItem('user', JSON.stringify({
          id: username,
          type: userType
        }));
        onLogin(userType);
        navigate(DEFAULT_ROUTES[userType]);
      } else {
        // Registration logic
        if (userType === USER_TYPES.STUDENT) {
          const { exists, message } = await checkStudentRegistration(username);
          if (exists) {
            setError(message || 'Student already registered');
            setIsLoading(false);
            return;
          }
          await registerStudent(formData);
        } else {
          const { exists, allowed, message } = await checkTeacherRegistration(username);
          if (exists) {
            setError(message || 'Teacher already registered');
            setIsLoading(false);
            return;
          }
          if (!allowed) {
            setError(message || 'Teacher ID not in allowed list');
            setIsLoading(false);
            return;
          }
          await registerTeacher(formData);
        }
        
        setError('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (error) {
      setError(error.message || (isLogin ? 'Login failed' : 'Registration failed'));
    } finally {
      setIsLoading(false);
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
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>{isLogin ? 'Logging in...' : 'Registering...'}</span>
              </div>
            ) : (isLogin ? 'Login' : 'Register')}
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