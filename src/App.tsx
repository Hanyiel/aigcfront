import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ExtractPage from "./pages/notes/ExtractPage";
import MindMapPage from "./pages/notes/MindMapPage";
import RecordPage from "./pages/questions/RecordPage";
// import { useAuth } from './contexts/AuthContext';
// import {JSX} from "react";

// 路由守卫组件
// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/home"
        element={
            <HomePage />
        }
      />
        <Route
        path="/notes/extract"
        element={
            <ExtractPage />
        }
      />
        <Route
        path="/notes/mind-map"
        element={
            <MindMapPage />
        }
      />
        <Route
        path="/questions/record"
        element={
            <RecordPage />
        }
      />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
