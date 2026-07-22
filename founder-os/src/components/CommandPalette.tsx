import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, Moon, Sun, Download, Command, Layers, X, ArrowRight } from 'lucide-react';
import { StartupIdea } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: StartupIdea[];
  onSelectIdea: (idea: StartupIdea) => void;
  onOpenNewIdea: () => void;
  toggleTheme: () => void;
  onExportAllJSON: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  ideas,
  onSelectIdea,
  onOpenNewIdea,
  toggleTheme,
  onExportAllJSON
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIdeas = ideas.filter(i => 
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.problem.toLowerCase().includes(query.toLowerCase()) ||
    i.oneSentenceDescription.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Buyruq kiriting yoki g'oyalarni qidiring..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          
          {/* Action Commands */}
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Tizim Buyruqlari
          </div>

          <button
            onClick={() => { onOpenNewIdea(); onClose(); }}
            className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Yangi Startap G'oyasi Yaratish</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">AI tahlili uchun yangi g'oya kiritish</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => { toggleTheme(); onClose(); }}
            className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Yorug' / Qorong'u Rejim</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Mavzu ko'rinishini o'zgartirish</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => { onExportAllJSON(); onClose(); }}
            className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Barcha G'oyalarni Yuklab Olish (JSON)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Zahira nusxa yaratish</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Ideas List */}
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 pt-3">
            Startap G'oyalari ({filteredIdeas.length})
          </div>

          {filteredIdeas.map((idea) => {
            const score = idea.analysis?.overallScore;
            const verdict = idea.analysis?.shouldBuild;

            return (
              <button
                key={idea.id}
                onClick={() => { onSelectIdea(idea); onClose(); }}
                className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold flex items-center justify-center">
                    {score !== undefined ? score : '?'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{idea.title}</span>
                      {verdict && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          verdict === 'YES' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          verdict === 'NO' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {verdict}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                      {idea.oneSentenceDescription || idea.problem}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-1">
                  Inspect <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            );
          })}

        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Use ↑ ↓ to navigate</span>
          <span>Esc to exit</span>
        </div>

      </div>
    </div>
  );
};
