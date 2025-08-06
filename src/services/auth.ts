// src/services/auth.ts
const API_URL = 'http://localhost:8000/api';

export const get_login_token = async (username: string, password: string) => {
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
  console.log(data);
  localStorage.setItem('authToken', data.data);
  localStorage.setItem('username', username); // 保存用户名到本地存储
  return data.data; // 确保后端返回{ token: "jwt_token" }
};

export const registerUser = async (
    credentials: {
      username: string;
      password: string;
      email: string
    }
): Promise<{ user_id: number }> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '注册失败');
  }
  return data.data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');

  // 简单验证token存在性（实际应验证过期时间）
  return !!token;
};
