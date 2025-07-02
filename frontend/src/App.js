import React, { useState, useEffect } from 'react';
import Dropzone from './components/Dropzone';
import RenderHTML from './components/RenderHTML';
import PreviewInbox from './components/PreviewInbox';
import LinksPanel from './components/LinksPanel';
import ResultsPanel from './components/ResultsPanel';
import SettingsPanel from './components/SettingsPanel';
import { Settings, Moon, Sun } from 'lucide-react';

function App() {
  const [htmlContent, setHtmlContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    subject: '',
    preheader: '',
    sender: ''
  });
  const [darkMode, setDarkMode] = useState(false);

  // Auto dark mode based on time
  useEffect(() => {
    const hour = new Date().getHours();
    const shouldBeDark = hour >= 18 || hour <= 6;
    setDarkMode(shouldBeDark);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const analyzeNewsletter = async () => {
    if (!htmlContent.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analyze-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html_content: htmlContent,
          openai_api_key: settings.openaiApiKey || null,
          subject: settings.subject || null,
          preheader: settings.preheader || null,
          sender: settings.sender || null
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'analyse de la newsletter');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🚀 Newsletter Analyzer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Testez votre newsletter HTML en 30 secondes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Basculer le mode sombre"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Dropzone
              onHtmlContent={setHtmlContent}
              htmlContent={htmlContent}
            />
            
            {showSettings && (
              <SettingsPanel
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onClose={() => setShowSettings(false)}
              />
            )}

            <button
              onClick={analyzeNewsletter}
              disabled={!htmlContent.trim() || isAnalyzing}
              className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 ${
                !htmlContent.trim() || isAnalyzing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-sunset-500 hover:bg-sunset-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Analyse en cours...
                </div>
              ) : (
                '🔍 Analyser la newsletter'
              )}
            </button>

            {analysisResult && (
              <LinksPanel links={analysisResult.links} />
            )}
          </div>

          {/* Right Column - Results and Preview */}
          <div className="lg:col-span-2 space-y-6">
            {analysisResult && (
              <>
                <PreviewInbox inboxPreview={analysisResult.inbox_preview} />
                <RenderHTML
                  htmlContent={htmlContent}
                  responsivePreview={analysisResult.responsive_preview}
                />
                <ResultsPanel
                  analysisResult={analysisResult}
                  htmlContent={htmlContent}
                />
              </>
            )}

            {!analysisResult && (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Prêt à analyser votre newsletter
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Collez votre code HTML dans la zone de gauche et cliquez sur "Analyser" pour commencer
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Newsletter Analyzer - Testez vos newsletters sans inscription</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;