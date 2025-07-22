import React, { useState } from 'react';
import { X, Key, Mail, User, Eye } from 'lucide-react';

const SettingsPanel = ({ settings, onSettingsChange, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleChange = (field, value) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Paramètres</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* OpenAI API Key */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Key className="w-4 h-4 mr-2" />
            Clé API OpenAI
            <span className="ml-2 px-2 py-0.5 text-xs bg-sunset-100 dark:bg-sunset-900 text-sunset-700 dark:text-sunset-300 rounded-full">
              Optionnel
            </span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={localSettings.openaiApiKey}
              onChange={(e) => handleChange('openaiApiKey', e.target.value)}
              placeholder="sk-..."
              className="input-field pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Nécessaire pour l'analyse IA (orthographe, grammaire, suggestions)
          </p>
        </div>

        {/* Email Subject */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Sujet de l'email
          </label>
          <input
            type="text"
            value={localSettings.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder="Votre sujet d'email..."
            className="input-field"
          />
        </div>

        {/* Preheader */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Eye className="w-4 h-4 mr-2" />
            Préheader
          </label>
          <input
            type="text"
            value={localSettings.preheader}
            onChange={(e) => handleChange('preheader', e.target.value)}
            placeholder="Texte de prévisualisation..."
            className="input-field"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Texte affiché dans la prévisualisation des clients email
          </p>
        </div>

        {/* Sender */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User className="w-4 h-4 mr-2" />
            Expéditeur
          </label>
          <input
            type="email"
            value={localSettings.sender}
            onChange={(e) => handleChange('sender', e.target.value)}
            placeholder="nom@exemple.com"
            className="input-field"
          />
        </div>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            💡 Comment obtenir une clé API OpenAI ?
          </h4>
          <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>1. Visitez <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">platform.openai.com</a></li>
            <li>2. Créez un compte ou connectez-vous</li>
            <li>3. Allez dans "API Keys" dans votre dashboard</li>
            <li>4. Cliquez sur "Create new secret key"</li>
            <li>5. Copiez et collez la clé ici</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
