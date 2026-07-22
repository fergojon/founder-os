import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Command, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  BarChart3, 
  ShieldAlert,
  Layers
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenNewIdea: () => void;
  onOpenCommandPalette: () => void;
  onExportAllJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalIdeasCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  isDark,
  toggleTheme,
  onOpenNewIdea,
  onOpenCommandPalette,
  onExportAllJSON,
  onImportJSON,
  totalIdeasCount
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2.5 group focus:outline-none"
            title="FounderOS Boshqaruv Paneliga O'tish"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">FounderOS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md">v2.5 O'zbek</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Startaplar Tahlili va Oqilona Qarorlar</p>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="G'oyalar, muammolar va teglar bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
            />
            <button
              onClick={onOpenCommandPalette}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 rounded flex items-center gap-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Command className="w-3 h-3" /> K
            </button>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Compare Button */}
          {totalIdeasCount >= 2 && (
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                viewMode === 'compare'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
              title="G'oyalarni yonma-yon taqqoslash"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Taqqoslash</span>
            </button>
          )}

          {/* Export / Import Backup */}
          <div className="hidden lg:flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
            <button
              onClick={onExportAllJSON}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Barcha g'oyalarni saqlash (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="JSON fayldan yuklab olish"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJSON}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title="Mavzuni o'zgartirish"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* New Startup Idea CTA */}
          <button
            onClick={onOpenNewIdea}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi G'oya</span>
          </button>

        </div>
      </div>
    </header>
  );
};
