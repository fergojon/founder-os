import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  ArrowUpRight
} from 'lucide-react';
import { StartupIdea, BuildVerdict } from '../types';

interface DashboardStatsProps {
  ideas: StartupIdea[];
  activeFilter: 'ALL' | BuildVerdict | 'UNANALYZED';
  setActiveFilter: (filter: 'ALL' | BuildVerdict | 'UNANALYZED') => void;
  onSelectIdea: (idea: StartupIdea) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans">
        <p className="font-bold text-slate-200">{data.fullTitle || data.range}</p>
        {data.score !== undefined && (
          <p className="font-mono text-emerald-400 font-extrabold text-sm">
            Umumiy Ball: {data.score} / 100
          </p>
        )}
        {data.count !== undefined && (
          <p className="font-mono text-emerald-400 font-extrabold text-sm">
            G'oyalar soni: {data.count} ta
          </p>
        )}
        {data.verdict && (
          <p className="text-[10px] uppercase font-mono text-slate-400">
            Xulosa: <span className={
              data.verdict === 'YES' ? 'text-emerald-400 font-bold' :
              data.verdict === 'NO' ? 'text-rose-400 font-bold' :
              data.verdict === 'LATER' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }>{data.verdict}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  ideas,
  activeFilter,
  setActiveFilter,
  onSelectIdea
}) => {
  const [chartMode, setChartMode] = useState<'scores' | 'distribution'>('scores');

  const totalIdeas = ideas.length;
  const analyzedIdeas = ideas.filter(i => i.analysis);
  const avgScore = analyzedIdeas.length > 0
    ? Math.round(analyzedIdeas.reduce((sum, i) => sum + (i.analysis?.overallScore || 0), 0) / analyzedIdeas.length)
    : 0;

  const readyToBuildCount = ideas.filter(i => i.analysis?.shouldBuild === 'YES').length;
  const failedCount = ideas.filter(i => i.analysis?.shouldBuild === 'NO').length;
  const laterCount = ideas.filter(i => i.analysis?.shouldBuild === 'LATER').length;

  // Top 5 Ideas ranked by score
  const top5Ideas = [...analyzedIdeas]
    .sort((a, b) => (b.analysis?.overallScore || 0) - (a.analysis?.overallScore || 0))
    .slice(0, 5);

  // Recharts Chart 1: Scores per idea
  const scoreData = ideas.map(idea => {
    const score = idea.analysis?.overallScore || 0;
    const verdict = idea.analysis?.shouldBuild || 'UNANALYZED';
    return {
      id: idea.id,
      title: idea.title.length > 14 ? idea.title.slice(0, 12) + '...' : idea.title,
      fullTitle: idea.title,
      score: score,
      verdict: verdict,
      fill: verdict === 'YES' ? '#10b981' : verdict === 'NO' ? '#f43f5e' : verdict === 'LATER' ? '#f59e0b' : '#64748b'
    };
  });

  // Recharts Chart 2: Distribution ranges
  const distributionData = [
    { range: '90 - 100', count: analyzedIdeas.filter(i => (i.analysis?.overallScore || 0) >= 90).length, fill: '#10b981' },
    { range: '80 - 89', count: analyzedIdeas.filter(i => (i.analysis?.overallScore || 0) >= 80 && (i.analysis?.overallScore || 0) < 90).length, fill: '#34d399' },
    { range: '70 - 79', count: analyzedIdeas.filter(i => (i.analysis?.overallScore || 0) >= 70 && (i.analysis?.overallScore || 0) < 80).length, fill: '#f59e0b' },
    { range: '60 - 69', count: analyzedIdeas.filter(i => (i.analysis?.overallScore || 0) >= 60 && (i.analysis?.overallScore || 0) < 60).length, fill: '#fb923c' },
    { range: '< 60', count: analyzedIdeas.filter(i => (i.analysis?.overallScore || 0) > 0 && (i.analysis?.overallScore || 0) < 60).length, fill: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Operating System Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                <Sparkles className="w-3.5 h-3.5" /> FounderOS Sun'iy Intellekt Tahlili
              </span>
              <span className="text-xs text-slate-400 font-mono">Oqilona Qarorlar Tizimi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Samarasiz g'oyalarga vaqtingizni sarflamang.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              FounderOS har bir startap g'oyasini kod yozishdan oldin sovuqqon investor tahlili, bozor xatarlari simulyatsiyasi va unit-ekonomika tekshiruvidan o'tkazadi.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/60 shrink-0">
            <div className="text-center px-3 border-r border-slate-700">
              <div className="text-2xl font-black font-mono text-emerald-400">{avgScore}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">O'rtacha Ball</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black font-mono text-white">{readyToBuildCount}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Qurishga Tayyor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Ideas */}
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-slate-100 dark:text-slate-950 dark:border-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami G'oyalar</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono">{totalIdeas}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">FounderOS Omborida</div>
        </button>

        {/* Average Score */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">O'rtacha Ball</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            {avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{analyzedIdeas.length} ta g'oya baholandi</div>
        </div>

        {/* Ideas Ready to Build */}
        <button
          onClick={() => setActiveFilter('YES')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeFilter === 'YES'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Qurishga Tayyor (HA)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{readyToBuildCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">VC Auditidan o'tdi</div>
        </button>

        {/* Failed / Rejected Ideas */}
        <button
          onClick={() => setActiveFilter('NO')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeFilter === 'NO'
              ? 'bg-rose-950 text-rose-100 border-rose-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Rad Etilgan (YO'Q)</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">{failedCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Oylab vaqt tejaldi</div>
        </button>

      </div>

      {/* Recharts Minimalistic Analytics Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-mono">
              G'oyalar Ballari va Tarqalishi
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setChartMode('scores')}
              className={`px-3 py-1 rounded-md transition-all ${
                chartMode === 'scores'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              G'oyalar Bo'yicha
            </button>
            <button
              onClick={() => setChartMode('distribution')}
              className={`px-3 py-1 rounded-md transition-all ${
                chartMode === 'distribution'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ballar Diapazoni
            </button>
          </div>
        </div>

        {ideas.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <BarChart3 className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Hali g'oyalar kiritilmagan
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Diagrammani va statistikalarni shakllantirish uchun yangi g'oya qo'shing.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'scores' ? (
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`dist-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Leaderboard Top 5 Section */}
      {top5Ideas.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-mono">
                Eng Yuqori Baholangan G'oyalar
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Ketma-ketlikda</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {top5Ideas.map((idea, index) => {
              const score = idea.analysis?.overallScore || 0;
              const verdict = idea.analysis?.shouldBuild;

              return (
                <div
                  key={idea.id}
                  onClick={() => onSelectIdea(idea)}
                  className="group relative p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                          {idea.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded font-mono ${
                          verdict === 'YES' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          verdict === 'NO' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {verdict}
                        </span>
                        <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">
                          {score}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {idea.oneSentenceDescription}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{idea.tags[0] || 'Startap'}</span>
                    <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-slate-700 dark:text-slate-300 font-medium">
                      Ko'rish <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Barchasi ({totalIdeas})
        </button>

        <button
          onClick={() => setActiveFilter('YES')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'YES'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Qurish Tayyor ({readyToBuildCount})
        </button>

        <button
          onClick={() => setActiveFilter('NO')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'NO'
              ? 'bg-rose-600 text-white font-semibold'
              : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Rad Etilgan ({failedCount})
        </button>

        <button
          onClick={() => setActiveFilter('LATER')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'LATER'
              ? 'bg-amber-600 text-white font-semibold'
              : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Keyinroq ({laterCount})
        </button>

        <button
          onClick={() => setActiveFilter('UNANALYZED')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
            activeFilter === 'UNANALYZED'
              ? 'bg-slate-700 text-white font-semibold'
              : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Kutilayotgan AI Tahlil ({ideas.length - analyzedIdeas.length})
        </button>
      </div>

    </div>
  );
};
