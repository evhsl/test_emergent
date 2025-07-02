import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Copy } from 'lucide-react';

const Dropzone = ({ onHtmlContent, htmlContent }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onHtmlContent(e.target.result);
      };
      reader.readAsText(file);
    }
  }, [onHtmlContent]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const handleTextareaChange = (e) => {
    onHtmlContent(e.target.value);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onHtmlContent(text);
    } catch (err) {
      console.error('Erreur lors du collage:', err);
    }
  };

  const handleRichPaste = async (e) => {
    e.preventDefault();
    
    try {
      const clipboardData = e.clipboardData || window.clipboardData;
      
      // Try to get HTML content first (rich text with links)
      const htmlData = clipboardData.getData('text/html');
      if (htmlData && htmlData.trim()) {
        console.log('Contenu HTML riche détecté');
        onHtmlContent(htmlData);
        return;
      }
      
      // Fallback to plain text
      const textData = clipboardData.getData('text/plain');
      if (textData && textData.trim()) {
        console.log('Contenu texte détecté');
        onHtmlContent(textData);
      }
    } catch (err) {
      console.error('Erreur lors du collage riche:', err);
      // Fallback to manual paste
      handlePaste();
    }
  };

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`card p-8 border-2 border-dashed cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-sunset-500 bg-sunset-50 dark:bg-sunset-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-sunset-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-sunset-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive ? 'Déposez votre fichier ici' : 'Glissez votre fichier HTML ici'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ou cliquez pour sélectionner un fichier (.html, .htm)
          </p>
        </div>
      </div>

      {/* Text Area */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Code HTML</h3>
          </div>
          <button
            onClick={handlePaste}
            className="flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Coller depuis le presse-papiers"
          >
            <Copy className="w-4 h-4 mr-1" />
            Coller
          </button>
        </div>
        
        <textarea
          value={htmlContent}
          onChange={handleTextareaChange}
          placeholder="Collez votre code HTML ici..."
          className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-sunset-500 focus:border-transparent resize-vertical font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
        />
        
        {htmlContent && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            📊 {htmlContent.length.toLocaleString()} caractères
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropzone;