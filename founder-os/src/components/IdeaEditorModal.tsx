import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Layers, ArrowRight, Save, Check } from 'lucide-react';
import { StartupIdea } from '../types';

interface IdeaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ideaData: Partial<StartupIdea>) => void;
  initialData?: StartupIdea | null;
  isSaving?: boolean;
}

export const IdeaEditorModal: React.FC<IdeaEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving
}) => {
  const [activeTab, setActiveTab] = useState<'concept' | 'market' | 'business' | 'risks'>('concept');

  const [formData, setFormData] = useState<Partial<StartupIdea>>({
    title: initialData?.title || '',
    oneSentenceDescription: initialData?.oneSentenceDescription || '',
    problem: initialData?.problem || '',
    targetUsers: initialData?.targetUsers || '',
    solution: initialData?.solution || '',
    whyNow: initialData?.whyNow || '',
    marketSize: initialData?.marketSize || '',
    competitors: initialData?.competitors || '',
    competitiveAdvantage: initialData?.competitiveAdvantage || '',
    businessModel: initialData?.businessModel || '',
    monetization: initialData?.monetization || '',
    mvp: initialData?.mvp || '',
    futureRoadmap: initialData?.futureRoadmap || '',
    risks: initialData?.risks || '',
    whyCouldFail: initialData?.whyCouldFail || '',
    personalMotivation: initialData?.personalMotivation || '',
    notes: initialData?.notes || '',
    tags: initialData?.tags || ['B2B SaaS'],
  });

  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleChange = (field: keyof StartupIdea, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const currentTags = formData.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...currentTags, tagInput.trim()] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Please enter a title for your startup idea.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {initialData ? "Startap G'oyasini Tahrirlash" : "Yangi Startap G'oyasini Kiritish"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FounderOS AI tahlili uchun obyektiv ma'lumotlarni to'ldiring.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-6 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('concept')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'concept'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Asosiy Konsept
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'market'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. Bozor va Afzallik
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'business'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            3. Biznes va MVP
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'risks'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            4. Xatarlar va Motivatsiya
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: Core Concept */}
          {activeTab === 'concept' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  G'oya Nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: CodeSentinel AI"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Bir Cümlali Tavsif
                </label>
                <input
                  type="text"
                  placeholder="G'oyaning mohiyatini bir jumlada tushuntiring..."
                  value={formData.oneSentenceDescription}
                  onChange={(e) => handleChange('oneSentenceDescription', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Mavjud Muammo
                </label>
                <textarea
                  rows={3}
                  placeholder="Mijozlar duch kelayotgan aniq muammo yoki yo'qotishlar nimadan iborat?"
                  value={formData.problem}
                  onChange={(e) => handleChange('problem', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Maqsadli Foydalanuvchilar
                </label>
                <input
                  type="text"
                  placeholder="Masalan: B2B SaaS kompaniyalari, dasturchilar, xususiy klinikalar..."
                  value={formData.targetUsers}
                  onChange={(e) => handleChange('targetUsers', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Yechim
                </label>
                <textarea
                  rows={3}
                  placeholder="Mahsulotingiz ushbu muammoni aynan qanday hal qiladi?"
                  value={formData.solution}
                  onChange={(e) => handleChange('solution', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Market & Advantage */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Nega Aynan Hozir? (Why Now?)
                </label>
                <textarea
                  rows={2}
                  placeholder="Qanday texnologik yoki bozor o'zgarishlari bu g'oyani bugun dolzarb qilmoqda?"
                  value={formData.whyNow}
                  onChange={(e) => handleChange('whyNow', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Bozor Hajmi (Market Size)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Boshlang'ich bozor hajmi $15M, har yili 20% o'smoqda"
                  value={formData.marketSize}
                  onChange={(e) => handleChange('marketSize', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Raqobatchilar
                </label>
                <textarea
                  rows={2}
                  placeholder="To'g'ridan-to'g'ri va bilvosita raqobatchilar..."
                  value={formData.competitors}
                  onChange={(e) => handleChange('competitors', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Raqobatbardosh Ustunlik
                </label>
                <textarea
                  rows={2}
                  placeholder="Mahsulotingiz raqobatchilardan qaysi jihati bilan ustun?"
                  value={formData.competitiveAdvantage}
                  onChange={(e) => handleChange('competitiveAdvantage', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Business & Execution */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Biznes Model
                </label>
                <input
                  type="text"
                  placeholder="Masalan: B2B SaaS oylik obuna..."
                  value={formData.businessModel}
                  onChange={(e) => handleChange('businessModel', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Monetizatsiya
                </label>
                <input
                  type="text"
                  placeholder="Masalan: $29/oy Boshlang'ich, $99/oy Pro tarif"
                  value={formData.monetization}
                  onChange={(e) => handleChange('monetization', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  MVP Ko'lami (Minimal Ishchi Mahsulot)
                </label>
                <textarea
                  rows={2}
                  placeholder="2 hafta ichida tayyorlash mumkin bo'lgan eng kichik ishchi versiya..."
                  value={formData.mvp}
                  onChange={(e) => handleChange('mvp', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Kelajakdagi Rivojlanish Rejasi (Roadmap)
                </label>
                <textarea
                  rows={2}
                  placeholder="Dastlabki muvaffaqiyatdan so'ng mahsulot qanday kengayadi?"
                  value={formData.futureRoadmap}
                  onChange={(e) => handleChange('futureRoadmap', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Risks & Motivation */}
          {activeTab === 'risks' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Asosiy Xatarlar (Risks)
                </label>
                <textarea
                  rows={2}
                  placeholder="Texnik, huquqiy yoki bozor xatarlari..."
                  value={formData.risks}
                  onChange={(e) => handleChange('risks', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Nega Bu Muvaffaqiyatsizlikka Uchrashi Mumkin?
                </label>
                <textarea
                  rows={2}
                  placeholder="Rostgo'y bo'ling: loyihani barbod qilishi mumkin bo me'zon nimada?"
                  value={formData.whyCouldFail}
                  onChange={(e) => handleChange('whyCouldFail', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Shaxsiy Motivatsiya
                </label>
                <textarea
                  rows={2}
                  placeholder="Nima uchun aynan SIZ bu g'oya ustida ishlashga eng munosib kishisiz?"
                  value={formData.personalMotivation}
                  onChange={(e) => handleChange('personalMotivation', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Teglar va Kategoriyalar
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Teg qo'shing (masalan: B2B SaaS, FinTech)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    Qo'shish
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(formData.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Qo'shimcha Qaydlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Mijozlar bilan suhbatlar, havolalar yoki eslatmalar..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              {activeTab !== 'concept' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'market') setActiveTab('concept');
                    else if (activeTab === 'business') setActiveTab('market');
                    else if (activeTab === 'risks') setActiveTab('business');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Orqaga
                </button>
              )}

              {activeTab !== 'risks' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'concept') setActiveTab('market');
                    else if (activeTab === 'market') setActiveTab('business');
                    else if (activeTab === 'business') setActiveTab('risks');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1"
                >
                  Keyingisi <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saqlanmoqda..." : initialData ? "O'zgarishlarni Saqlash" : "Saqlash va AI Tahlil"}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
