import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Code2, 
  Download, 
  Trash2, 
  MoreVertical,
  Edit3
} from 'lucide-react';
import { StartupIdea } from '../types';

interface IdeaCardProps {
  idea: StartupIdea;
  onSelect: (idea: StartupIdea) => void;
  onEdit: (idea: StartupIdea) => void;
  onDelete: (id: string) => void;
  onRunAnalysis: (idea: StartupIdea) => void;
  isAnalyzing?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onSelect,
  onEdit,
  onDelete,
  onRunAnalysis,
  isAnalyzing
}) => {
  const analysis = idea.analysis;
  const score = analysis?.overallScore;
  const verdict = analysis?.shouldBuild;

  // Score badge color helper
  const getScoreColor = (val?: number) => {
    if (val === undefined) return 'bg-slate-200 dark:bg-slate-800 text-slate-500';
    if (val >= 80) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (val >= 60) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {verdict === 'YES' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> QURISH (HA)
              </span>
            )}
            {verdict === 'NO' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <XCircle className="w-3 h-3" /> RAD ETILGAN (YO'Q)
              </span>
            )}
            {verdict === 'LATER' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-3 h-3" /> KEYINROQ
              </span>
            )}
            {!verdict && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                TAHLIL QILINMAGAN
              </span>
            )}

            {idea.tags.slice(0, 2).map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {t}
              </span>
            ))}
          </div>

          {/* Overall Score Badge */}
          <div className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black border flex items-center gap-1.5 ${getScoreColor(score)}`}>
            <span className="text-[10px] font-normal uppercase opacity-75">Ball</span>
            <span>{score !== undefined ? `${score}/100` : '—'}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div onClick={() => onSelect(idea)} className="cursor-pointer group-hover:text-emerald-500 transition-colors">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight line-clamp-1">
            {idea.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {idea.oneSentenceDescription || idea.problem}
          </p>
        </div>

        {/* Quick Scores Mini-Matrix if analyzed */}
        {analysis && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="text-[9px] font-mono uppercase text-slate-400">Bozor Talabi</div>
              <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{analysis.scores.marketNeed}/100</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="text-[9px] font-mono uppercase text-slate-400">Monetizatsiya</div>
              <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{analysis.scores.monetization}/100</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="text-[9px] font-mono uppercase text-slate-400">AI Qiymati</div>
              <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{analysis.scores.aiValue}/100</div>
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(idea)}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="G'oyani tahrirlash"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => onDelete(idea.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="G'oyani o'chirish"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!analysis ? (
            <button
              onClick={() => onRunAnalysis(idea)}
              disabled={isAnalyzing}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Tahlil qilinmoqda...' : 'AI Tahlilni Boshlash'}</span>
            </button>
          ) : (
            <button
              onClick={() => onSelect(idea)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm transition-all flex items-center gap-1.5 group-hover:translate-x-0.5"
            >
              <span>Batafsil Ko'rish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
