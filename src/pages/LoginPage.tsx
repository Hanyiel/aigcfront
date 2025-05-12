// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { isAuthenticated, login } from '../services/auth';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain } from '@fortawesome/free-solid-svg-icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  };

  return (
      <div className="main-container">
        <div className="system-brand">
          <FontAwesomeIcon
              icon={faBrain}
              className="brand-icon"
              beatFade
          />
          <h1 className="brand-title">
            <span className="brand-main">LinkMind</span>
            <span className="brand-sub">—— 智能学习云脑引擎</span>
          </h1>
          <div className="brand-underline"></div>
        </div>
        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">用户登录</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
              />
            </div>
            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>
            <button type="submit" className="login-button">登录</button>
          </form>
        </div>
      </div>

  );
};

export default LoginPage;
