import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import './styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (credentials.username === 'admin' && credentials.password === '123456') {
        login('dummy-token');
        navigate('/home');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="login-container">
      <h1>系统登录</h1>
      {error && <div className="error-message">{error}</div>}
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
};

export default LoginPage;
