import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain } from '@fortawesome/free-solid-svg-icons';
import '../styles/RegisterPage.css'; // 复用登录样式
import { useAuth } from "../contexts/AuthContext";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth();

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }

      // 自动登录逻辑
      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        authContextLogin(loginData.token);
        navigate('/home');
      } else {
        navigate('/login'); // 注册成功但自动登录失败时跳转登录页
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册过程中发生错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="register-title">用户注册</h2>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '注册中...' : '立即注册'}
          </button>

          <div className="auth-redirect">
            已有账号？<button
              type="button"
              className="link-button"
              onClick={() => navigate('/login')}
            >
              去登录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
