import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Smartphone, Moon, Sun } from 'lucide-react';

const RenderHTML = ({ htmlContent, responsivePreview }) => {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
  const [darkMode, setDarkMode] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Inject dark mode styles if needed
      let styledContent = htmlContent;
      if (darkMode) {
        styledContent = `
          <style>
            body { 
              background-color: #1a1a1a !important; 
              color: #e5e5e5 !important; 
            }
            table { 
              background-color: #2a2a2a !important; 
            }
            * { 
              color: #e5e5e5 !important; 
            }
            a { 
              color: #60a5fa !important; 
            }
          </style>
          ${htmlContent}
        `;
      }
      
      doc.open();
      doc.write(styledContent);
      doc.close();
    }
  }, [htmlContent, darkMode]);

  const getIframeWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return '375px';
      case 'desktop':
      default:
        return '600px';
    }
  };

  if (!htmlContent) {
    return null;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📱 Prévisualisation responsive
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4 mr-1" />
              Desktop
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 flex justify-center">
        <div 
          className="transition-all duration-300 shadow-lg rounded-lg overflow-hidden bg-white"
          style={{ width: getIframeWidth() }}
        >
          <div className="bg-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="text-xs text-gray-600">
              {viewMode === 'desktop' ? '600px' : '375px'} 
              {darkMode && ' • Mode sombre'}
            </div>
          </div>
          
          <iframe
            ref={iframeRef}
            title="Newsletter Preview"
            className="w-full border-0"
            style={{ 
              height: '600px',
              width: '100%'
            }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Prévisualisation {viewMode === 'desktop' ? 'desktop (600px)' : 'mobile (375px)'}
        {darkMode && ' en mode sombre'}
      </div>
    </div>
  );
};

export default RenderHTML;
