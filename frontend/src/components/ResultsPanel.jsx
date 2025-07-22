import React, { useState } from 'react';
import { Download, FileText, Brain, AlertTriangle, CheckCircle, XCircle, Star, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';

const ResultsPanel = ({ analysisResult, htmlContent }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!analysisResult) {
    return null;
  }

  const { ai_analysis, html_issues, report, links } = analysisResult;

  // Calculate overall score
  const calculateOverallScore = () => {
    let totalScore = 0;
    let scoreCount = 0;

    if (ai_analysis && !ai_analysis.error) {
      const aiScores = [
        ai_analysis.orthographe_grammaire?.score || 0,
        ai_analysis.lisibilite?.score || 0,
        ai_analysis.cta_evaluation?.efficacite || 0,
        ai_analysis.sujet_preheader?.sujet_score || 0,
        ai_analysis.structure?.score || 0
      ];
      totalScore += aiScores.reduce((a, b) => a + b, 0);
      scoreCount += aiScores.length;
    }

    // Add link score
    const successfulLinks = links.filter(link => link.status === 'success').length;
    const linkScore = links.length > 0 ? (successfulLinks / links.length) * 10 : 10;
    totalScore += linkScore;
    scoreCount += 1;

    // Add HTML issues score
    const htmlScore = Math.max(0, 10 - html_issues.length);
    totalScore += htmlScore;
    scoreCount += 1;

    return scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
  };

  const overallScore = calculateOverallScore();

  const exportToMarkdown = () => {
    let markdown = `# Rapport d'analyse Newsletter\n\n`;
    markdown += `**Date:** ${new Date().toLocaleDateString('fr-FR')}\n`;
    markdown += `**Score global:** ${overallScore}/10\n\n`;

    // Summary
    markdown += `## 📊 Résumé\n\n`;
    markdown += `- **Liens totaux:** ${report.total_links}\n`;
    markdown += `- **Liens cassés:** ${report.broken_links}\n`;
    markdown += `- **Problèmes HTML:** ${html_issues.length}\n`;
    markdown += `- **Problèmes critiques:** ${report.critical_issues.length}\n\n`;

    // Critical Issues
    if (report.critical_issues.length > 0) {
      markdown += `## ❌ Problèmes critiques\n\n`;
      report.critical_issues.forEach(issue => {
        markdown += `- ${issue}\n`;
      });
      markdown += `\n`;
    }

    // Warnings
    if (report.warnings.length > 0) {
      markdown += `## ⚠️ Avertissements\n\n`;
      report.warnings.forEach(warning => {
        markdown += `- ${warning}\n`;
      });
      markdown += `\n`;
    }

    // AI Analysis
    if (ai_analysis && !ai_analysis.error) {
      markdown += `## 🧠 Analyse IA\n\n`;
      
      if (ai_analysis.orthographe_grammaire) {
        markdown += `### Orthographe & Grammaire (${ai_analysis.orthographe_grammaire.score}/10)\n`;
        ai_analysis.orthographe_grammaire.suggestions?.forEach(suggestion => {
          markdown += `- ${suggestion}\n`;
        });
        markdown += `\n`;
      }

      if (ai_analysis.lisibilite) {
        markdown += `### Lisibilité (${ai_analysis.lisibilite.score}/10)\n`;
        markdown += `**Niveau:** ${ai_analysis.lisibilite.niveau}\n`;
        ai_analysis.lisibilite.suggestions?.forEach(suggestion => {
          markdown += `- ${suggestion}\n`;
        });
        markdown += `\n`;
      }
    }

    // Download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-rapport-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Rapport d\'analyse Newsletter', 20, 30);
    
    // Date and score
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 50);
    doc.text(`Score global: ${overallScore}/10`, 20, 65);
    
    let yPosition = 85;
    
    // Summary
    doc.setFontSize(16);
    doc.text('Résumé', 20, yPosition);
    yPosition += 20;
    
    doc.setFontSize(12);
    doc.text(`Liens totaux: ${report.total_links}`, 30, yPosition);
    yPosition += 15;
    doc.text(`Liens cassés: ${report.broken_links}`, 30, yPosition);
    yPosition += 15;
    doc.text(`Problèmes HTML: ${html_issues.length}`, 30, yPosition);
    yPosition += 25;

    // Critical Issues
    if (report.critical_issues.length > 0) {
      doc.setFontSize(16);
      doc.text('Problèmes critiques', 20, yPosition);
      yPosition += 20;
      
      doc.setFontSize(12);
      report.critical_issues.forEach(issue => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(`• ${issue}`, 30, yPosition);
        yPosition += 15;
      });
      yPosition += 10;
    }
    
    doc.save(`newsletter-rapport-${Date.now()}.pdf`);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 6) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📄 Rapport d'analyse
        </h3>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${getScoreColor(overallScore)}`}>
            {getScoreIcon(overallScore)}
            <span className="ml-2 font-bold text-lg">
              {overallScore}/10
            </span>
          </div>
          <button
            onClick={exportToMarkdown}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Exporter en Markdown"
          >
            <FileText className="w-4 h-4 mr-1" />
            MD
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-3 py-2 text-sm bg-sunset-100 dark:bg-sunset-900 text-sunset-700 dark:text-sunset-300 hover:bg-sunset-200 dark:hover:bg-sunset-800 rounded-lg transition-colors"
            title="Exporter en PDF"
          >
            <Download className="w-4 h-4 mr-1" />
            PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-sunset-500 text-sunset-600 dark:text-sunset-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          📊 Résumé
        </button>
        {ai_analysis && !ai_analysis.error && (
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-sunset-500 text-sunset-600 dark:text-sunset-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🧠 Analyse IA
          </button>
        )}
        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'technical'
              ? 'border-sunset-500 text-sunset-600 dark:text-sunset-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          🔧 Technique
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Critical Issues */}
            {report.critical_issues.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="flex items-center text-red-900 dark:text-red-300 font-medium mb-3">
                  <XCircle className="w-5 h-5 mr-2" />
                  Problèmes critiques ({report.critical_issues.length})
                </h4>
                <ul className="space-y-2">
                  {report.critical_issues.map((issue, index) => (
                    <li key={index} className="text-red-700 dark:text-red-400 text-sm">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {report.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="flex items-center text-yellow-900 dark:text-yellow-300 font-medium mb-3">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  À améliorer ({report.warnings.length})
                </h4>
                <ul className="space-y-2">
                  {report.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-700 dark:text-yellow-400 text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success */}
            {report.critical_issues.length === 0 && report.warnings.length === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="flex items-center text-green-900 dark:text-green-300 font-medium mb-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Excellent travail !
                </h4>
                <p className="text-green-700 dark:text-green-400 text-sm">
                  Votre newsletter semble prête à être envoyée. Aucun problème critique détecté.
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.total_links}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Liens totaux
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {report.broken_links}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Liens cassés
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {html_issues.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Problèmes HTML
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Score global
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai' && ai_analysis && !ai_analysis.error && (
          <div className="space-y-6">
            {/* Orthographe & Grammaire */}
            {ai_analysis.orthographe_grammaire && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    📝 Orthographe & Grammaire
                  </h4>
                  <div className={`flex items-center ${getScoreColor(ai_analysis.orthographe_grammaire.score)}`}>
                    <Star className="w-4 h-4 mr-1" />
                    {ai_analysis.orthographe_grammaire.score}/10
                  </div>
                </div>
                {ai_analysis.orthographe_grammaire.suggestions && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {ai_analysis.orthographe_grammaire.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Lisibilité */}
            {ai_analysis.lisibilite && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    📖 Lisibilité
                  </h4>
                  <div className={`flex items-center ${getScoreColor(ai_analysis.lisibilite.score)}`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {ai_analysis.lisibilite.score}/10
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Niveau: <span className="font-medium">{ai_analysis.lisibilite.niveau}</span>
                </p>
                {ai_analysis.lisibilite.suggestions && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {ai_analysis.lisibilite.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* CTA Evaluation */}
            {ai_analysis.cta_evaluation && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    🎯 Call-to-Action
                  </h4>
                  <div className={`flex items-center ${getScoreColor(ai_analysis.cta_evaluation.efficacite)}`}>
                    <Star className="w-4 h-4 mr-1" />
                    {ai_analysis.cta_evaluation.efficacite}/10
                  </div>
                </div>
                {ai_analysis.cta_evaluation.ctas_detectes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    CTA détectés: {ai_analysis.cta_evaluation.ctas_detectes.join(', ')}
                  </p>
                )}
                {ai_analysis.cta_evaluation.suggestions && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {ai_analysis.cta_evaluation.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Sujet & Préheader */}
            {ai_analysis.sujet_preheader && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  📧 Sujet & Préheader
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sujet:</span>
                    <div className={`text-lg font-medium ${getScoreColor(ai_analysis.sujet_preheader.sujet_score)}`}>
                      {ai_analysis.sujet_preheader.sujet_score}/10
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Préheader:</span>
                    <div className={`text-lg font-medium ${getScoreColor(ai_analysis.sujet_preheader.preheader_score)}`}>
                      {ai_analysis.sujet_preheader.preheader_score}/10
                    </div>
                  </div>
                </div>
                {ai_analysis.sujet_preheader.suggestions && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {ai_analysis.sujet_preheader.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Technical Tab */}
        {activeTab === 'technical' && (
          <div className="space-y-4">
            {/* HTML Issues */}
            {html_issues.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  🔧 Problèmes HTML détectés
                </h4>
                <ul className="space-y-2">
                  {html_issues.map((issue, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Stats */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                📊 Statistiques techniques
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taille HTML:</span>
                  <div className="font-medium">{htmlContent.length.toLocaleString()} caractères</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Analyse générée:</span>
                  <div className="font-medium">{new Date(report.analysis_timestamp).toLocaleString('fr-FR')}</div>
                </div>
              </div>
            </div>

            {html_issues.length === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="flex items-center text-green-900 dark:text-green-300 font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Code HTML propre
                </h4>
                <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                  Aucun problème technique détecté dans votre code HTML.
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Error */}
        {activeTab === 'ai' && ai_analysis?.error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="flex items-center text-yellow-900 dark:text-yellow-300 font-medium mb-2">
              <Brain className="w-5 h-5 mr-2" />
              Analyse IA non disponible
            </h4>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              {ai_analysis.error}
            </p>
            <p className="text-yellow-600 dark:text-yellow-500 text-xs mt-2">
              Ajoutez votre clé API OpenAI dans les paramètres pour activer l'analyse IA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
