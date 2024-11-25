import React from 'react';
import '../../../css/Button.css';

const Button = ({ 
  type = 'button',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  children
}) => {
  const baseClassName = 'custom-button';
  const loadingClassName = loading ? 'loading' : '';
  const finalClassName = `${baseClassName} ${className} ${loadingClassName}`.trim();

  return (
    <button
      type={type}
      className={finalClassName}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>{typeof children === 'string' ? children.replace('Login', 'Logging in').replace('Register', 'Registering') : 'Loading...'}</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button; 