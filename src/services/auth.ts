// src/services/auth.ts
const API_URL = 'http://localhost:8000/api';

interface User {
  id: number;
  username: string;
  email: string;
}

export const login = async (username: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  console.log("yes");
  return {
    id: data.user_id,
    username: data.username,
    email: '' // 根据实际接口返回补充
  };
};

export const register = async (username: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
};

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('authToken');
  // 这里可以添加解析 JWT 获取用户信息的逻辑
  return token ? { id: 1, username: 'demo', email: 'demo@example.com' } : null;
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};
