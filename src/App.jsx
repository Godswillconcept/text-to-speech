import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <MainLayout 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navigationItems={NAV_ITEMS}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text-to-speech" element={<TextToSpeech />} />
            <Route path="/pdf-to-speech" element={<PdfToSpeech />} />
            <Route path="/paraphraser" element={<ParaphraserPage />} />
            <Route path="/summarizer" element={<SummarizerPage />} />
            <Route path="/key-points" element={<KeyPointsPage />} />
            <Route path="/change-tone" element={<ChangeTonePage />} />
            <Route path="/operations" element={<OperationsPage />} />
          </Routes>
        </MainLayout>
      </div>
    </Router>
  );
}

export default App;