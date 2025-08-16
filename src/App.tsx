import { Routes, Route, Navigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import ProtectedRoute from "./components/ProtectRoute";
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import HomePage from './pages/HomePage';
/* ========== Notes ========== */
import NotePage from "./pages/notes/NotePage";
import NoteIndexPage from "./pages/notes/NoteIndexPage";
import ExtractPage from "./pages/notes/ExtractPage";
import MindMapPage from "./pages/notes/MindMapPage";
import KeywordsPage from "./pages/notes/KeywordsPage";
import SmartLectureLayout from "./pages/notes/SmartLecturePage";
import NoteSavePage from "./pages/notes/NoteSavePage";
/* ========== Questions ========== */
import QuestionPage from "./pages/questions/QuetionPage";
import QuestionIndexPage from "./pages/questions/QuestionIndexPage";
import QuestionExtractPage from "./pages/questions/QuestionExtractPage";
import QuestionKeywordsPage from "./pages/questions/QuestionKeywordsPage";
import QuestionExplanationPage from "./pages/questions/QuestionExplanationPage";
import RelatedNotesPage from "./pages/questions/RelatedNotePage";
import AutoGradePage from "./pages/questions/AutoGradePage";
import SaveQuestionPage from "./pages/questions/SaveQuestionPage";
/* ========== UserCenter ========== */
import UserCenter from "./pages/userCenter/UserCenter";
import ProfilePage from "./pages/userCenter/ProfilePage";
import SecurityPage from "./pages/userCenter/SecurityPage";
import NotesManagementPage from "./pages/userCenter/NotesManagementPage";
import QuestionsManagementPage from "./pages/userCenter/QuestionsManagementPage";
/* ========== Provider ========== */
import { ImageProvider } from './contexts/ImageContext';
import { ExplanationProvider } from './contexts/ExplanationContext';
import { MindMapProvider} from "./contexts/MindMapContext";
import { ExtractProvider } from "./contexts/ExtractContext";
import { KeywordsProvider } from "./contexts/NoteKeywordsContext";
import { QuestionImageProvider } from './contexts/QuestionImageContext';
import { QuestionExtractProvider} from "./contexts/QuestionExtractContext";
import { QuestionKeywordsProvider } from "./contexts/QuestionKeywordsContext";
import { QuestionExplanationProvider } from './contexts/QuestionExplanationContext';
import { RelatedNoteProvider} from "./contexts/RelatedNoteContext";
import {AutoGradeProvider} from "./contexts/AutoGradeContext";
import { UserNoteProvider } from "./contexts/userCenter/UserNoteContext";
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
            <ExplanationProvider>
                <ExtractProvider>
                    <MindMapProvider>
                        <KeywordsProvider>
                            <QuestionImageProvider>
                                <QuestionExtractProvider>
                                    <QuestionKeywordsProvider>
                                        <QuestionExplanationProvider>
                                            <RelatedNoteProvider>
                                                <AutoGradeProvider>
                                                    <UserNoteProvider>
                                                        <Routes>
                                                            <Route path="/login" element={<LoginPage />} />
                                                            <Route path="/register" element={<RegisterPage />} />
                                                            <Route element={<ProtectedRoute />}>
                                                                <Route
                                                                    path="/home"
                                                                    element={
                                                                        <HomePage />
                                                                    }
                                                                />
                                                            </Route>
                                                            <Route element={<ProtectedRoute />}>
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
                                                                        path="extract"
                                                                        element={
                                                                            <QuestionExtractPage />
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
                                                            </Route>
                                                            <Route element={<ProtectedRoute />}>
                                                                <Route
                                                                    path="/user-center"
                                                                    element={
                                                                        <UserCenter />
                                                                    }
                                                                >
                                                                    <Route index element={<Navigate to="profile" replace />} />
                                                                    <Route
                                                                        path="profile"
                                                                        element={
                                                                            <ProfilePage/>
                                                                        }
                                                                    />
                                                                    <Route
                                                                        path="security"
                                                                        element={
                                                                            <SecurityPage />
                                                                        }
                                                                    />
                                                                    <Route
                                                                        path="notes-management"
                                                                        element={
                                                                            <NotesManagementPage />
                                                                        }
                                                                    />
                                                                    <Route
                                                                        path="questions-management"
                                                                        element={
                                                                            <QuestionsManagementPage />
                                                                        }
                                                                    />
                                                                </Route>
                                                            </Route>
                                                            <Route path="*" element={<Navigate to="/login" replace />} />
                                                        </Routes>
                                                    </UserNoteProvider>
                                                </AutoGradeProvider>
                                            </RelatedNoteProvider>
                                        </QuestionExplanationProvider>
                                    </QuestionKeywordsProvider>
                                </QuestionExtractProvider>
                            </QuestionImageProvider>
                        </KeywordsProvider>
                    </MindMapProvider>
                </ExtractProvider>
            </ExplanationProvider>
        </ImageProvider>
    );
}

export default App;
