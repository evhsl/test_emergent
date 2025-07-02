import React, { useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, AlertTriangle, Eye, Link } from 'lucide-react';
import LinkPreview from './LinkPreview';

const LinksPanel = ({ links }) => {
  const [selectedLink, setSelectedLink] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!links || links.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-sunset-500 rounded-full animate-spin"></div>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-l-gray-300 bg-gray-50 dark:bg-gray-700';
    }
  };

  const statusCounts = links.reduce((acc, link) => {
    acc[link.status] = (acc[link.status] || 0) + 1;
    return acc;
  }, {});

  const handleLinkPreview = (link, event) => {
    event.preventDefault();
    setSelectedLink(link);
    setShowPreview(true);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔗 Vérification des liens ({links.length})
        </h3>
        
        {/* Status Summary */}
        <div className="flex items-center space-x-3 text-sm">
          {statusCounts.success > 0 && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              {statusCounts.success}
            </div>
          )}
          {statusCounts.error > 0 && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <XCircle className="w-4 h-4 mr-1" />
              {statusCounts.error}
            </div>
          )}
          {statusCounts.warning > 0 && (
            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {statusCounts.warning}
            </div>
          )}
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {links.map((link, index) => (
          <div
            key={index}
            className={`border-l-4 rounded-lg p-4 transition-colors ${getStatusColor(link.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-2">
                  {getStatusIcon(link.status)}
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    {link.text || 'Lien sans texte'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  {link.favicon && (
                    <img 
                      src={link.favicon} 
                      alt="" 
                      className="w-4 h-4 mr-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="truncate mr-2">{link.url}</span>
                  {link.status_code && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      link.status === 'success' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : link.status === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {link.status_code}
                    </span>
                  )}
                </div>
                
                {link.title && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {link.title}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => handleLinkPreview(link, e)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Aperçu du lien"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Ouvrir le lien"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link Preview Modal */}
      {showPreview && selectedLink && (
        <LinkPreview
          link={selectedLink}
          onClose={() => {
            setShowPreview(false);
            setSelectedLink(null);
          }}
        />
      )}
    </div>
  );
};

export default LinksPanel;