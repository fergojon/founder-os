import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { IdeaCard } from './components/IdeaCard';
import { IdeaEditorModal } from './components/IdeaEditorModal';
import { IdeaDetailView } from './components/IdeaDetailView';
import { CommandPalette } from './components/CommandPalette';
import { IdeaComparisonModal } from './components/IdeaComparisonModal';
import { SAMPLE_IDEAS } from './data/sampleIdeas';
import { StartupIdea, ViewMode, BuildVerdict } from './types';
import { Plus, Search, Layers, Sparkles, Filter } from 'lucide-react';

const STORAGE_KEY = 'founderos_ideas_v3';
const THEME_KEY = 'founderos_theme_v1';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === 'dark';
    return true; // Default dark minimalist
  });

  // Ideas state - starts empty by default
  const [ideas, setIdeas] = useState<StartupIdea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return [];
  });

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | BuildVerdict | 'UNANALYZED'>('ALL');

  // Modal controls
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<StartupIdea | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Analysis loading tracker
  const [analyzingIdeaId, setAnalyzingIdeaId] = useState<string | null>(null);

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  // Sync ideas with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [ideas]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Selected idea object helper
  const selectedIdea = ideas.find(i => i.id === selectedIdeaId) || null;

  // Save idea (create or update)
  const handleSaveIdea = async (formData: Partial<StartupIdea>) => {
    if (editingIdea) {
      // Update existing
      const updatedIdeas = ideas.map(i => {
        if (i.id === editingIdea.id) {
          return {
            ...i,
            ...formData,
            updatedAt: new Date().toISOString()
          } as StartupIdea;
        }
        return i;
      });
      setIdeas(updatedIdeas);
    } else {
      // Create new
      const newIdea: StartupIdea = {
        id: `idea-${Date.now()}`,
        title: formData.title || 'Untitled Startup Concept',
        oneSentenceDescription: formData.oneSentenceDescription || '',
        problem: formData.problem || '',
        targetUsers: formData.targetUsers || '',
        solution: formData.solution || '',
        whyNow: formData.whyNow || '',
        marketSize: formData.marketSize || '',
        competitors: formData.competitors || '',
        competitiveAdvantage: formData.competitiveAdvantage || '',
        businessModel: formData.businessModel || '',
        monetization: formData.monetization || '',
        mvp: formData.mvp || '',
        futureRoadmap: formData.futureRoadmap || '',
        risks: formData.risks || '',
        whyCouldFail: formData.whyCouldFail || '',
        personalMotivation: formData.personalMotivation || '',
        notes: formData.notes || '',
        tags: formData.tags || ['B2B SaaS'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newIdeas = [newIdea, ...ideas];
      setIdeas(newIdeas);

      // Auto-trigger AI Analysis on new idea creation!
      handleRunAnalysis(newIdea, newIdeas);
    }

    setIsEditorOpen(false);
    setEditingIdea(null);
  };

  // Delete idea
  const handleDeleteIdea = (id: string) => {
    if (confirm("Rostdan ham ushbu startap g'oyasini FounderOS'dan o'chirmoqchimisiz?")) {
      const remaining = ideas.filter(i => i.id !== id);
      setIdeas(remaining);
      if (selectedIdeaId === id) {
        setSelectedIdeaId(null);
        setViewMode('dashboard');
      }
    }
  };

  // Run AI Analysis via backend endpoint
  const handleRunAnalysis = async (ideaToAnalyze: StartupIdea, currentIdeas = ideas) => {
    setAnalyzingIdeaId(ideaToAnalyze.id);
    try {
      const res = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaToAnalyze }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        const updated = currentIdeas.map(i => {
          if (i.id === ideaToAnalyze.id) {
            return {
              ...i,
              analysis: data.analysis,
              updatedAt: new Date().toISOString()
            };
          }
          return i;
        });
        setIdeas(updated);
      } else {
        alert(data.error || "G'oyani tahlil qilishda xatolik yuz berdi.");
      }
    } catch (err: any) {
      alert('Serverga ulanishda xatolik yuz berdi: ' + err.message);
    } finally {
      setAnalyzingIdeaId(null);
    }
  };

  // Export all JSON backup
  const handleExportAllJSON = () => {
    const dataStr = JSON.stringify(ideas, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `founderos-xotira-zaxirasi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setIdeas(parsed);
          alert(`FounderOS ga ${parsed.length} ta startap g'oyasi muvaffaqiyatli yuklandi!`);
        } else {
          alert("Xato format. Fayl g'oyalar ro'yxatini o'z ichiga olishi kerak.");
        }
      } catch (err) {
        alert("JSON faylini o'qishda xatolik.");
      }
    };
    reader.readAsText(file);
  };

  // Filter & Search ideas
  const filteredIdeas = ideas.filter(idea => {
    // Search query filter
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.oneSentenceDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Verdict Filter
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNANALYZED') return !idea.analysis;
    return idea.analysis?.shouldBuild === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenNewIdea={() => {
          setEditingIdea(null);
          setIsEditorOpen(true);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onExportAllJSON={handleExportAllJSON}
        onImportJSON={handleImportJSON}
        totalIdeasCount={ideas.length}
      />

      {/* Main Container Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: DASHBOARD */}
        {viewMode === 'dashboard' && (
          <div className="space-y-8">
            
            {/* KPI Stats & Category Filters */}
            <DashboardStats
              ideas={ideas}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              onSelectIdea={(idea) => {
                setSelectedIdeaId(idea.id);
                setViewMode('idea-detail');
              }}
            />

            {/* Ideas Grid Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                    G'oyalar Xazinasi ({filteredIdeas.length})
                  </h2>
                </div>

                {searchQuery && (
                  <span className="text-xs text-slate-500 font-mono">
                    Filtr: "{searchQuery}"
                  </span>
                )}
              </div>

              {filteredIdeas.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mos keladigan g'oyalar topilmadi</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Qidiruv so'zini o'zgartiring yoki filtrni tozalab barcha g'oyalarni ko'ring.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilter('ALL');
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  >
                    Filtrlarni Tozalash
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onSelect={(selected) => {
                        setSelectedIdeaId(selected.id);
                        setViewMode('idea-detail');
                      }}
                      onEdit={(target) => {
                        setEditingIdea(target);
                        setIsEditorOpen(true);
                      }}
                      onDelete={handleDeleteIdea}
                      onRunAnalysis={handleRunAnalysis}
                      isAnalyzing={analyzingIdeaId === idea.id}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: IDEA DETAIL HUB */}
        {viewMode === 'idea-detail' && selectedIdea && (
          <IdeaDetailView
            idea={selectedIdea}
            onBack={() => setViewMode('dashboard')}
            onEdit={(target) => {
              setEditingIdea(target);
              setIsEditorOpen(true);
            }}
            onUpdateIdea={(updated) => {
              setIdeas(ideas.map(i => i.id === updated.id ? updated : i));
            }}
            onRunAnalysis={(target) => handleRunAnalysis(target)}
            isAnalyzing={analyzingIdeaId === selectedIdea.id}
          />
        )}

        {/* VIEW 3: COMPARISON MATRIX */}
        {viewMode === 'compare' && (
          <IdeaComparisonModal
            isOpen={true}
            onClose={() => setViewMode('dashboard')}
            ideas={ideas}
            onSelectIdea={(idea) => {
              setSelectedIdeaId(idea.id);
              setViewMode('idea-detail');
            }}
          />
        )}

      </main>

      {/* MODALS */}
      
      {/* Idea Creation / Editor Modal */}
      <IdeaEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingIdea(null);
        }}
        onSave={handleSaveIdea}
        initialData={editingIdea}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        ideas={ideas}
        onSelectIdea={(idea) => {
          setSelectedIdeaId(idea.id);
          setViewMode('idea-detail');
        }}
        onOpenNewIdea={() => {
          setEditingIdea(null);
          setIsEditorOpen(true);
        }}
        toggleTheme={toggleTheme}
        onExportAllJSON={handleExportAllJSON}
      />

    </div>
  );
}
