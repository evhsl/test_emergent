import React from 'react';
import { X, ExternalLink, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const LinkPreview = ({ link, onClose }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 border-t-sunset-500 rounded-full animate-spin"></div>;
    }
  };

  const getStatusMessage = (status, statusCode) => {
    switch (status) {
      case 'success':
        return `✅ Lien accessible (${statusCode})`;
      case 'error':
        if (statusCode === 404) {
          return '❌ Page non trouvée (404)';
        }
        return `❌ Erreur d'accès ${statusCode ? `(${statusCode})` : ''}`;
      case 'warning':
        return `⚠️ Attention ${statusCode ? `(${statusCode})` : ''}`;
      default:
        return '🔄 Vérification en cours...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Aperçu du lien
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center">
            {getStatusIcon(link.status)}
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
              {getStatusMessage(link.status, link.status_code)}
            </span>
          </div>

          {/* Link Text */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Texte du lien
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              {link.text || 'Aucun texte'}
            </p>
          </div>

          {/* URL */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              URL
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3 break-all">
              {link.url}
            </p>
          </div>

          {/* Page Title */}
          {link.title && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre de la page
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {link.title}
              </p>
            </div>
          )}

          {/* Favicon */}
          {link.favicon && (
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                Favicon
              </label>
              <img
                src={link.favicon}
                alt="Favicon"
                className="w-6 h-6"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden">
                Non disponible
              </span>
            </div>
          )}

          {/* Preview Image */}
          {link.preview_image && (
            <div>
              <img
                src={link.preview_image}
                alt="Aperçu"
                className="w-full h-40 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Description */}
          {link.description && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {link.description}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Informations techniques
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Code de statut HTTP: {link.status_code || 'Non vérifié'}</li>
              <li>• Type de lien: {link.url.startsWith('mailto:') ? 'Email' : link.url.startsWith('tel:') ? 'Téléphone' : 'Web'}</li>
              <li>• Protocole: {link.url.startsWith('https:') ? 'HTTPS (sécurisé)' : link.url.startsWith('http:') ? 'HTTP (non sécurisé)' : 'Autre'}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-sunset-500 hover:bg-sunset-600 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ouvrir le lien
          </a>
        </div>
      </div>
    </div>
  );
};

export default LinkPreview;
