import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Edit3, 
  HelpCircle, 
  Code2, 
  RefreshCw, 
  MessageSquare, 
  Layers, 
  Share2, 
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  CheckCheck
} from 'lucide-react';
import { StartupIdea, AnalysisResult, CriticMode, ChallengingQuestion, ProjectPrompt } from '../types';
import { exportIdeaPDF } from '../lib/pdfExport';
import { downloadMarkdown } from '../lib/markdownExport';

interface IdeaDetailViewProps {
  idea: StartupIdea;
  onBack: () => void;
  onEdit: (idea: StartupIdea) => void;
  onUpdateIdea: (updated: StartupIdea) => void;
  onRunAnalysis: (idea: StartupIdea) => Promise<void>;
  isAnalyzing: boolean;
}

export const IdeaDetailView: React.FC<IdeaDetailViewProps> = ({
  idea,
  onBack,
  onEdit,
  onUpdateIdea,
  onRunAnalysis,
  isAnalyzing
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'analysis' | 'critic' | 'questions' | 'prompt'>('analysis');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [targetTool, setTargetTool] = useState<'cursor' | 'claude' | 'chatgpt' | 'gemini' | 'windsurf'>('cursor');

  // Loading states
  const [loadingCritic, setLoadingCritic] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [evaluatingAssumptionId, setEvaluatingAssumptionId] = useState<string | null>(null);

  // Local state for founder answers to 10 questions
  const [founderAnswers, setFounderAnswers] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    (idea.questions || []).forEach(q => {
      if (q.founderAnswer) initial[q.id] = q.founderAnswer;
    });
    return initial;
  });

  // Local state for founder counter arguments in critic mode
  const [counterArgs, setCounterArgs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (idea.criticMode?.keyAssumptionsChallenged || []).forEach(c => {
      if (c.founderResponse) initial[c.id] = c.founderResponse;
    });
    return initial;
  });

  const analysis = idea.analysis;
  const critic = idea.criticMode;
  const questions = idea.questions || [];
  const prompt = idea.projectPrompt;

  // Trigger Critic Mode API
  const handleFetchCriticMode = async () => {
    setLoadingCritic(true);
    try {
      const res = await fetch('/api/critic-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...idea, criticMode: data.criticMode };
        onUpdateIdea(updated);
      } else {
        alert(data.error || 'Failed to run Critic Mode');
      }
    } catch (err: any) {
      alert('Error connecting to server: ' + err.message);
    } finally {
      setLoadingCritic(false);
    }
  };

  // Trigger Counter Argument Evaluation API
  const handleEvaluateCounterArg = async (assumptionId: string, assumptionStr: string, challengeStr: string) => {
    const founderText = counterArgs[assumptionId];
    if (!founderText || !founderText.trim()) {
      alert('Please type your counter-argument defense first.');
      return;
    }

    setEvaluatingAssumptionId(assumptionId);
    try {
      const res = await fetch('/api/evaluate-counter-argument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assumption: assumptionStr,
          challenge: challengeStr,
          founderResponse: founderText,
        }),
      });
      const data = await res.json();
      if (data.success && critic) {
        const updatedChallenges = critic.keyAssumptionsChallenged.map(item => {
          if (item.id === assumptionId) {
            return {
              ...item,
              founderResponse: founderText,
              aiCritique: data.evaluation.aiCritique,
              critiqueVerdict: data.evaluation.critiqueVerdict
            };
          }
          return item;
        });

        const updated = {
          ...idea,
          criticMode: { ...critic, keyAssumptionsChallenged: updatedChallenges }
        };
        onUpdateIdea(updated);
      }
    } catch (err: any) {
      alert('Error evaluating defense: ' + err.message);
    } finally {
      setEvaluatingAssumptionId(null);
    }
  };

  // Trigger 10 Questions API
  const handleFetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...idea, questions: data.questions };
        onUpdateIdea(updated);
      } else {
        alert(data.error || 'Failed to generate questions');
      }
    } catch (err: any) {
      alert('Error generating questions: ' + err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Trigger Project Prompt Generator API
  const handleGenerateProjectPrompt = async (toolOverride?: typeof targetTool) => {
    const selectedTool = toolOverride || targetTool;
    setLoadingPrompt(true);
    try {
      const res = await fetch('/api/generate-project-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, targetTool: selectedTool }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...idea, projectPrompt: data.projectPrompt };
        onUpdateIdea(updated);
      } else {
        alert(data.error || 'Failed to generate prompt');
      }
    } catch (err: any) {
      alert('Error generating prompt: ' + err.message);
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = () => {
    if (!prompt?.fullPromptText) return;
    navigator.clipboard.writeText(prompt.fullPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Export JSON for single idea
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(idea, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-founderos.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Boshqaruv Paneliga Qaytish</span>
        </button>

        {/* Right Actions (Exports, Edit, Re-Analyze) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onEdit(idea)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
          </button>

          <button
            onClick={() => onRunAnalysis(idea)}
            disabled={isAnalyzing}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Tahlil qilinmoqda...' : 'Qayta AI Tahlil'}</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 hidden sm:block" />

          {/* Export Dropdown buttons */}
          <button
            onClick={() => downloadMarkdown(idea)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Markdown eksport (.md)"
          >
            <FileText className="w-3.5 h-3.5" /> .MD
          </button>

          <button
            onClick={() => exportIdeaPDF(idea)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="PDF hisobotni yuklash"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>

          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="JSON ma'lumotni yuklash"
          >
            <Code2 className="w-3.5 h-3.5" /> JSON
          </button>
        </div>
      </div>

      {/* Idea Main Title Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              {analysis?.shouldBuild === 'YES' && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> QURISH (HA)
                </span>
              )}
              {analysis?.shouldBuild === 'NO' && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> RAD ETILGAN (YO'Q)
                </span>
              )}
              {analysis?.shouldBuild === 'LATER' && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> KEYINROQ
                </span>
              )}

              {idea.tags.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {t}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {idea.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {idea.oneSentenceDescription || idea.problem}
            </p>
          </div>

          {/* Overall OS Score Gauge */}
          {analysis && (
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={analysis.overallScore >= 80 ? 'text-emerald-500' : analysis.overallScore >= 60 ? 'text-amber-500' : 'text-rose-500'}
                    strokeDasharray={`${analysis.overallScore}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">{analysis.overallScore}</span>
                  <span className="block text-[8px] font-mono uppercase text-slate-400">Ball</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase">
                  Xulosa Asosi
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs line-clamp-3 leading-relaxed mt-0.5">
                  {analysis.verdictRationale}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1 scrollbar-none">
        
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'analysis'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Investor Tahlili</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('critic');
            if (!critic && !loadingCritic) handleFetchCriticMode();
          }}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'critic'
              ? 'bg-rose-950 text-rose-100 border border-rose-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>AI Tanqidchi Rejimi</span>
          {critic && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
        </button>

        <button
          onClick={() => {
            setActiveTab('questions');
            if (questions.length === 0 && !loadingQuestions) handleFetchQuestions();
          }}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'questions'
              ? 'bg-indigo-950 text-indigo-100 border border-indigo-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>10 Qiyin Savol</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('prompt');
            if (!prompt && !loadingPrompt) handleGenerateProjectPrompt();
          }}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'prompt'
              ? 'bg-emerald-950 text-emerald-100 border border-emerald-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Master G'oya Prompti</span>
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'canvas'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>G'oya Tafsilotlari</span>
        </button>

      </div>

      {/* TAB CONTENT AREA */}

      {/* TAB 1: AI INVESTOR ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {!analysis ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">This startup idea has not been evaluated yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Run FounderOS AI Analysis to generate detailed scores, competitor checks, hidden risks, and an investor verdict.
              </p>
              <button
                onClick={() => onRunAnalysis(idea)}
                disabled={isAnalyzing}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing Idea...' : 'Trigger AI Investor Audit'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* 10-Point Score Matrix Radar Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Quantitative Score Breakdown (0-100)
                  </h3>
                  <span className="text-xs font-mono text-slate-400">10 Key Pillars</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Market Need', val: analysis.scores.marketNeed },
                    { label: 'Originality', val: analysis.scores.originality },
                    { label: 'Competition', val: analysis.scores.competition },
                    { label: 'Execution', val: analysis.scores.difficulty },
                    { label: 'Monetization', val: analysis.scores.monetization },
                    { label: 'Scalability', val: analysis.scores.scalability },
                    { label: 'Founder Fit', val: analysis.scores.founderFit },
                    { label: 'Tech Feasibility', val: analysis.scores.technicalComplexity },
                    { label: 'GTM Feasibility', val: analysis.scores.goToMarketDifficulty },
                    { label: 'AI Value', val: analysis.scores.aiValue },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">{item.label}</div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{item.val}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/100</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.val >= 80 ? 'bg-emerald-500' : item.val >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths vs Weaknesses Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20 p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4" /> Core Strengths
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysis.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-500/20 p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4" /> Strategic Weaknesses
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysis.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Hidden Risks & Biggest Mistake Warning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-500/20 p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4" /> Hidden Market Risks
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysis.hiddenRisks.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4" /> Single Biggest Mistake to Avoid
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-200">
                      "{analysis.biggestMistake}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 mb-1">Recommended MVP Strategy</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.mvpRecommendation}
                    </p>
                  </div>
                </div>

              </div>

              {/* Competitor & Persona Intelligence */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" /> Market Intelligence & Competitor Ecosystem
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="font-bold font-mono text-slate-500 block mb-1">Similar Products</span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {analysis.similarProducts.map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="font-bold font-mono text-slate-500 block mb-1">Possible Competitors</span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {analysis.possibleCompetitors.map((c, i) => <li key={i}>• {c}</li>)}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="font-bold font-mono text-slate-500 block mb-1">Target Buyer Personas</span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {analysis.potentialCustomers.map((cust, i) => <li key={i}>• {cust}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      )}

      {/* TAB 2: AI CRITIC MODE */}
      {activeTab === 'critic' && (
        <div className="space-y-6">
          {!critic ? (
            <div className="p-12 text-center bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
              <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-extrabold text-white">AI Critic Mode (Investor Challenge)</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                No cheerleading. The AI acts as a cold Lead VC Partner at Benchmark challenging your core assumptions, OpenAI threats, and GTM mechanics.
              </p>
              <button
                onClick={handleFetchCriticMode}
                disabled={loadingCritic}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all inline-flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{loadingCritic ? 'Simulating VC Challenge...' : 'Enter Critic Mode'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Investor Persona Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-6 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Simulated Lead VC Partner</span>
                  <h3 className="text-xl font-extrabold text-white">{critic.investorPersona}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Auditing startup assumptions for zero-delusion execution.</p>
                </div>
                <button
                  onClick={handleFetchCriticMode}
                  disabled={loadingCritic}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCritic ? 'animate-spin' : ''}`} /> Re-Run Critic Audit
                </button>
              </div>

              {/* 4 Existential VC Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <div className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase">
                    1. What if OpenAI / Big Tech releases this?
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{critic.openaiThreat}"
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <div className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase">
                    2. Why won't users stick to Excel / status quo?
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{critic.statusQuoThreat}"
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <div className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase">
                    3. How will you get your first 100 paying users?
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{critic.first100UsersChallenge}"
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                  <div className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase">
                    4. Why would someone pay?
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{critic.monetizationHurdle}"
                  </p>
                </div>

              </div>

              {/* Interactive Assumption Challenger (Defend Your Idea) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    Challenged Key Assumptions — Defend Your Startup
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Interactive VC Defense</span>
                </div>

                <div className="space-y-4">
                  {critic.keyAssumptionsChallenged.map((item, idx) => {
                    const currentVal = counterArgs[item.id] || '';

                    return (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold font-mono text-slate-500">
                            Assumption #{idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            item.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                            item.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {item.severity} SEVERITY
                          </span>
                        </div>

                        <div className="text-xs text-slate-900 dark:text-white font-semibold">
                          "{item.assumption}"
                        </div>

                        <div className="text-xs text-rose-600 dark:text-rose-400 italic bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                          <strong>VC Challenge:</strong> {item.challenge}
                        </div>

                        {/* Founder Defense Textarea */}
                        <div className="space-y-2 pt-1">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono uppercase">
                            Your Counter-Argument / Defense Strategy
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Explain specifically how your product or GTM addresses this VC challenge..."
                            value={currentVal}
                            onChange={(e) => setCounterArgs({ ...counterArgs, [item.id]: e.target.value })}
                            className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleEvaluateCounterArg(item.id, item.assumption, item.challenge)}
                              disabled={evaluatingAssumptionId === item.id}
                              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>{evaluatingAssumptionId === item.id ? 'Evaluating Defense...' : 'Submit Defense to VC'}</span>
                            </button>
                          </div>
                        </div>

                        {/* AI Critique Feedback */}
                        {item.aiCritique && (
                          <div className={`mt-3 p-3 rounded-lg text-xs space-y-1 border ${
                            item.critiqueVerdict === 'VALIDATED' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200' :
                            item.critiqueVerdict === 'WEAK' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200' :
                            'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                          }`}>
                            <div className="flex items-center justify-between font-mono font-bold text-[10px] uppercase">
                              <span>AI Rating: {item.critiqueVerdict}</span>
                              <span>Investor Feedback</span>
                            </div>
                            <p className="leading-relaxed">"{item.aiCritique}"</p>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: 10 CHALLENGING QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  10 Tough Investor Questions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Answer these to test your own conviction before pitching partners.
                </p>
              </div>

              <button
                onClick={handleFetchQuestions}
                disabled={loadingQuestions}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingQuestions ? 'animate-spin' : ''}`} />
                <span>{questions.length > 0 ? 'Regenerate Questions' : 'Generate 10 Questions'}</span>
              </button>
            </div>

            {loadingQuestions && (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-mono">
                Generating 10 tailored investor questions...
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-4 pt-2">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                      <span>Question #{q.id}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.category}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {q.question}
                    </p>

                    <div className="pt-2">
                      <textarea
                        rows={2}
                        placeholder="Type your founder answer here..."
                        value={founderAnswers[q.id] || ''}
                        onChange={(e) => setFounderAnswers({ ...founderAnswers, [q.id]: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    {q.aiFeedback && (
                      <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
                        <strong>AI Feedback:</strong> {q.aiFeedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MASTER IDEA PROMPT GENERATOR */}
      {activeTab === 'prompt' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Master Startap G'oya Prompti (Idea Blueprint)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dasturlash kodisiz g'oyaning tub ma'nosi, operatsion mexanizmi va biznes strategiyasini yoritib beruvchi Master Prompt.
                </p>
              </div>

              {/* Target Tool Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400">Mo'ljallangan AI:</span>
                {(['chatgpt', 'claude', 'gemini', 'cursor', 'windsurf'] as const).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => {
                      setTargetTool(tool);
                      handleGenerateProjectPrompt(tool);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg uppercase transition-all ${
                      targetTool === tool
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {loadingPrompt && (
              <div className="p-12 text-center text-xs text-slate-400 animate-pulse font-mono">
                G'oyaning Master Blueprint va strategik prompti {targetTool.toUpperCase()} uchun tayyorlanmoqda...
              </div>
            )}

            {prompt && !loadingPrompt && (
              <div className="space-y-4">
                
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-slate-500">
                    Tayyorlandi: <strong>{prompt.targetTool.toUpperCase()}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPrompt}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? 'Nusxalandi!' : 'Promptni Nusxalash'}</span>
                    </button>
                  </div>
                </div>

                {/* Prompt Text Block */}
                <div className="relative bg-slate-950 text-slate-100 rounded-xl p-5 border border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto max-h-[550px]">
                  <pre className="whitespace-pre-wrap">{prompt.fullPromptText}</pre>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 5: IDEA SPECIFICATIONS CANVAS */}
      {activeTab === 'canvas' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Complete Idea Specifications (17 Mandatory Fields)
            </h3>
            <button
              onClick={() => onEdit(idea)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Edit Fields
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Title</span>
                <p className="text-slate-900 dark:text-white font-semibold text-sm">{idea.title}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">One Sentence Description</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.oneSentenceDescription || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Problem</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.problem || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Target Users</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.targetUsers || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Solution</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.solution || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Why Now?</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.whyNow || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Market Size</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.marketSize || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Competitors</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.competitors || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Competitive Advantage</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.competitiveAdvantage || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Business Model</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.businessModel || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Monetization</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.monetization || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">MVP Scope</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.mvp || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Future Roadmap</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.futureRoadmap || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Primary Risks</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.risks || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-rose-500 font-mono uppercase block">Why This Could Fail</span>
                <p className="text-rose-600 dark:text-rose-400">{idea.whyCouldFail || 'N/A'}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 font-mono uppercase block">Personal Motivation</span>
                <p className="text-slate-700 dark:text-slate-300">{idea.personalMotivation || 'N/A'}</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
