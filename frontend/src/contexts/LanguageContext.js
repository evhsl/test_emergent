import React, { createContext, useContext, useState } from 'react';

const translations = {
  fr: {
    title: "Newsletter Analyzer",
    subtitle: "Testez votre newsletter HTML en 30 secondes",
    analyzeButton: "🔍 Analyser la newsletter",
    analyzing: "Analyse en cours...",
    settings: "Paramètres",
    dropzoneTitle: "Glissez votre fichier HTML ici",
    dropzoneSubtitle: "ou cliquez pour sélectionner un fichier (.html, .htm)",
    dropzoneActive: "Déposez votre fichier ici",
    htmlCodeTitle: "Code HTML",
    paste: "Coller",
    htmlPlaceholder: "Collez votre code HTML ici ou du contenu riche avec liens...",
    charactersCount: "caractères",
    readyToAnalyze: "Prêt à analyser votre newsletter",
    pasteHtmlLeft: "Collez votre code HTML dans la zone de gauche et cliquez sur \"Analyser\" pour commencer",
    responsivePreview: "📱 Prévisualisation responsive",
    desktop: "Desktop",
    mobile: "Mobile",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    inboxPreview: "📥 Aperçu boîte de réception",
    linksVerification: "🔗 Vérification des liens",
    analysisReport: "📄 Rapport d'analyse",
    footerText: "Newsletter Analyzer - Testez vos newsletters sans inscription"
  },
  en: {
    title: "Newsletter Analyzer",
    subtitle: "Test your HTML newsletter in 30 seconds",
    analyzeButton: "🔍 Analyze newsletter",
    analyzing: "Analyzing...",
    settings: "Settings",
    dropzoneTitle: "Drop your HTML file here",
    dropzoneSubtitle: "or click to select a file (.html, .htm)",
    dropzoneActive: "Drop your file here",
    htmlCodeTitle: "HTML Code",
    paste: "Paste",
    htmlPlaceholder: "Paste your HTML code here or rich content with links...",
    charactersCount: "characters",
    readyToAnalyze: "Ready to analyze your newsletter",
    pasteHtmlLeft: "Paste your HTML code in the left area and click \"Analyze\" to start",
    responsivePreview: "📱 Responsive preview",
    desktop: "Desktop",
    mobile: "Mobile",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    inboxPreview: "📥 Inbox preview",
    linksVerification: "🔗 Links verification",
    analysisReport: "📄 Analysis report",
    footerText: "Newsletter Analyzer - Test your newsletters without registration"
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};