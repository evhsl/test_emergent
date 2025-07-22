import React, { useState } from 'react';
import { Mail, Smartphone } from 'lucide-react';

const PreviewInbox = ({ inboxPreview }) => {
  const [selectedClient, setSelectedClient] = useState('gmail');

  if (!inboxPreview) {
    return null;
  }

  const clients = {
    gmail: {
      name: 'Gmail',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: '📬'
    },
    apple_mail: {
      name: 'Apple Mail',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: '📧'
    }
  };

  const currentClient = clients[selectedClient];
  const currentPreview = inboxPreview[selectedClient];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📥 Aperçu boîte de réception
        </h3>
        
        {/* Client Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {Object.entries(clients).map(([key, client]) => (
            <button
              key={key}
              onClick={() => setSelectedClient(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedClient === key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {client.icon} {client.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gmail Style Preview */}
      {selectedClient === 'gmail' && (
        <div className={`rounded-xl border-2 ${currentClient.borderColor} ${currentClient.bgColor} overflow-hidden`}>
          {/* Gmail Header */}
          <div className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                G
              </div>
              <span>Gmail</span>
            </div>
          </div>
          
          {/* Email Item */}
          <div className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="px-4 py-3 flex items-start">
              <div className="w-10 h-10 bg-gradient-to-br from-sunset-400 to-sunset-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                {currentPreview?.sender ? currentPreview.sender.charAt(0).toUpperCase() : 'S'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentPreview?.sender || 'sender@example.com'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    maintenant
                  </p>
                </div>
                
                <div className="flex items-center mt-1">
                  <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                    {currentPreview?.subject || 'Sujet de votre newsletter'}
                  </p>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    -
                  </span>
                  <p className="ml-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                    {currentPreview?.preheader || 'Prévisualisation de votre contenu...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apple Mail Style Preview */}
      {selectedClient === 'apple_mail' && (
        <div className={`rounded-xl border-2 ${currentClient.borderColor} ${currentClient.bgColor} overflow-hidden`}>
          {/* Apple Mail Header */}
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 mr-2" />
              <span>Mail</span>
            </div>
          </div>
          
          {/* Email Item */}
          <div className="bg-white dark:bg-gray-800">
            <div className="px-4 py-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                  {currentPreview?.sender ? currentPreview.sender.charAt(0).toUpperCase() : 'S'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {currentPreview?.sender || 'sender@example.com'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      maintenant
                    </p>
                  </div>
                  
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    {currentPreview?.subject || 'Sujet de votre newsletter'}
                  </h4>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPreview?.preheader || 'Prévisualisation de votre contenu...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Simulation de l'affichage dans {currentClient.name}
      </div>
    </div>
  );
};

export default PreviewInbox;
