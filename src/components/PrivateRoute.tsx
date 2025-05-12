// components/PrivateRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 监听 storage 变化
    const handleStorageChange = () => setAuthChecked(isAuthenticated());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!authChecked) {
    // 首次加载时检查
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
  }

  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};
