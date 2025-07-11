import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { NAV_ITEMS } from './utils/constants';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import TextToSpeech from './pages/TextToSpeech';
import PdfToSpeech from './pages/PdfToSpeech';
import ParaphraserPage from './pages/ParaphraserPage';
import SummarizerPage from './pages/SummarizerPage';
import KeyPointsPage from './pages/KeyPointsPage';
import ChangeTonePage from './pages/ChangeTonePage';
import OperationsPage from './pages/OperationsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth.js';
import './App.css';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';

// A component to handle public-only routes (login/register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isInitialized } = useAuth();

  // Show loading state while initializing auth
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <MainLayout 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navigationItems={NAV_ITEMS}
        >
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/text-to-speech" element={
              <ProtectedRoute>
                <TextToSpeech />
              </ProtectedRoute>
            } />
            <Route path="/pdf-to-speech" element={
              <ProtectedRoute>
                <PdfToSpeech />
              </ProtectedRoute>
            } />
            <Route path="/paraphraser" element={
              <ProtectedRoute>
                <ParaphraserPage />
              </ProtectedRoute>
            } />
            <Route path="/summarizer" element={
              <ProtectedRoute>
                <SummarizerPage />
              </ProtectedRoute>
            } />
            <Route path="/key-points" element={
              <ProtectedRoute>
                <KeyPointsPage />
              </ProtectedRoute>
            } />
            <Route path="/change-tone" element={
              <ProtectedRoute>
                <ChangeTonePage />
              </ProtectedRoute>
            } />
            <Route path="/operations" element={
              <ProtectedRoute>
                <OperationsPage />
              </ProtectedRoute>
            } />
            {/* Catch-all route for 404s */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </div>
    </Router>
  );
}

export default App;