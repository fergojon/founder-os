import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, ShieldAlert, BarChart3, ArrowRight } from 'lucide-react';
import { StartupIdea } from '../types';

interface IdeaComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: StartupIdea[];
  onSelectIdea: (idea: StartupIdea) => void;
}

export const IdeaComparisonModal: React.FC<IdeaComparisonModalProps> = ({
  isOpen,
  onClose,
  ideas,
  onSelectIdea
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    ideas.slice(0, 3).map(i => i.id)
  );

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return; // Keep at least 1
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 3) return; // Max 3
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedIdeas = ideas.filter(i => selectedIds.includes(i.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                G'oyalarni Taqqoslash Matratsasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ballar, bozor xatarlari, monetizatsiya va AI investor xulosalarini taqqoslang.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Pills */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono uppercase shrink-0">
            2-3 ta g'oyani tanlang:
          </span>
          {ideas.map((idea) => {
            const isSelected = selectedIds.includes(idea.id);
            return (
              <button
                key={idea.id}
                onClick={() => toggleSelect(idea.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}{idea.title}
              </button>
            );
          })}
        </div>

        {/* Comparison Matrix Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-xs font-mono font-bold uppercase text-slate-400 w-48">Metrika</th>
                {comparedIdeas.map(idea => (
                  <th key={idea.id} className="p-3 text-sm font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-extrabold">{idea.title}</span>
                      <button
                        onClick={() => { onSelectIdea(idea); onClose(); }}
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                      >
                        Batafsil
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              
              {/* Overall Verdict */}
              <tr>
                <td className="p-3 font-mono font-bold text-slate-500">AI Xulosasi</td>
                {comparedIdeas.map(idea => {
                  const verdict = idea.analysis?.shouldBuild;
                  return (
                    <td key={idea.id} className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold inline-flex items-center gap-1 ${
                        verdict === 'YES' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        verdict === 'NO' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                        verdict === 'LATER' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {verdict === 'YES' ? 'HA' : verdict === 'NO' ? "YO'Q" : verdict === 'LATER' ? 'KEYINROQ' : 'Tahlil qilinmagan'}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Overall Score */}
              <tr>
                <td className="p-3 font-mono font-bold text-slate-500">Umumiy Ball</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 font-mono text-base font-black text-slate-900 dark:text-white">
                    {idea.analysis?.overallScore !== undefined ? `${idea.analysis.overallScore} / 100` : 'Mavjud emas'}
                  </td>
                ))}
              </tr>

              {/* Market Need */}
              <tr>
                <td className="p-3 font-mono font-medium text-slate-500">Bozor Ehtiyoji</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 font-mono font-bold">
                    {idea.analysis?.scores.marketNeed ?? '—'}/100
                  </td>
                ))}
              </tr>

              {/* Monetization */}
              <tr>
                <td className="p-3 font-mono font-medium text-slate-500">Monetizatsiya Imkoniyati</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 font-mono font-bold">
                    {idea.analysis?.scores.monetization ?? '—'}/100
                  </td>
                ))}
              </tr>

              {/* Competition Favorability */}
              <tr>
                <td className="p-3 font-mono font-medium text-slate-500">Raqobat Holati</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 font-mono font-bold">
                    {idea.analysis?.scores.competition ?? '—'}/100
                  </td>
                ))}
              </tr>

              {/* GTM Feasibility */}
              <tr>
                <td className="p-3 font-mono font-medium text-slate-500">Bozorga Kirish (GTM)</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 font-mono font-bold">
                    {idea.analysis?.scores.goToMarketDifficulty ?? '—'}/100
                  </td>
                ))}
              </tr>

              {/* Problem Statement */}
              <tr>
                <td className="p-3 font-mono font-medium text-slate-500">Muammo</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {idea.problem}
                  </td>
                ))}
              </tr>

              {/* Business Model */}
              <tr>
                <td className="p-3 font-mono font-medium text-slate-500">Biznes Model</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 text-slate-700 dark:text-slate-300">
                    {idea.businessModel || '—'}
                  </td>
                ))}
              </tr>

              {/* Biggest Mistake */}
              <tr>
                <td className="p-3 font-mono font-medium text-rose-500">Eng Katta Xato</td>
                {comparedIdeas.map(idea => (
                  <td key={idea.id} className="p-3 text-rose-600 dark:text-rose-400 italic">
                    {idea.analysis?.biggestMistake || '—'}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
