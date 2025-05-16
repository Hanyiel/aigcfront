import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NotePage from "./pages/notes/NotePage";
import NoteIndexPage from "./pages/notes/NoteIndexPage";
import ExtractPage from "./pages/notes/ExtractPage";
import MindMapPage from "./pages/notes/MindMapPage";
import KeywordsPage from "./pages/notes/KeywordsPage";
import SmartLectureLayout from "./pages/notes/SmartLecturePage";
import NoteSavePage from "./pages/notes/NoteSavePage";
import QuestionPage from "./pages/questions/QuetionPage";
import QuestionIndexPage from "./pages/questions/QuestionIndexPage";
import QuestionKeywordsPage from "./pages/questions/QuestionKeywordsPage";
import QuestionExplanationPage from "./pages/questions/QuestionExplanationPage";
import RelatedNotesPage from "./pages/questions/RelatedNotePage";
import AutoGradePage from "./pages/questions/AutoGradePage";
import SaveQuestionPage from "./pages/questions/SaveQuestionPage";
import RecordPage from "./pages/questions/RecordPage";
import { ImageProvider } from './contexts/ImageContext';

// import { useAuth } from './contexts/AuthContext';
// import {JSX} from "react";

// 路由守卫组件
// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

function App() {
    return (
        <ImageProvider>

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/home"
                    element={
                        <HomePage />
                    }
                />
                <Route
                    path="/notes"
                    element={
                        <NotePage />
                    }
                >
                    <Route index element={<Navigate to="index" replace />} />
                    <Route
                        path="index"
                        element={
                            <NoteIndexPage />
                        }
                    />
                    <Route
                        path="extract"
                        element={
                            <ExtractPage />
                        }
                    />
                    <Route
                        path="mind-map"
                        element={
                            <MindMapPage />
                        }
                    />
                    <Route
                        path="keywords"
                        element={
                            <KeywordsPage />
                        }
                    />
                    <Route
                        path="smart-lecture"
                        element={
                            <SmartLectureLayout />
                        }
                    />
                    <Route
                        path="save"
                        element={
                            <NoteSavePage />
                        }
                    />
                </Route>
                <Route
                    path="/questions"
                    element={
                        <QuestionPage />
                    }
                >
                    <Route index element={<Navigate to="index" replace />} />
                    <Route
                        path="index"
                        element={
                            <QuestionIndexPage />
                        }
                    />
                    <Route
                        path="keywords"
                        element={
                            <QuestionKeywordsPage />
                        }
                    />
                    <Route
                        path="explanation"
                        element={
                            <QuestionExplanationPage />
                        }
                    />
                    <Route
                        path="related-notes"
                        element={
                            <RelatedNotesPage />
                        }
                    />
                    <Route
                        path="auto-grade"
                        element={
                            <AutoGradePage />
                        }
                    />
                    <Route
                        path="save"
                        element={
                            <SaveQuestionPage />
                        }
                    />
                </Route>
                <Route
                    path="/questions/record"
                    element={
                        <RecordPage />
                    }
                />

                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </ImageProvider>
    );
}

export default App;
