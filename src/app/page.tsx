'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, BookOpen, Clock, Users, Quote, ChevronRight, X, ArrowUpRight, Flame, Library, Network, History } from 'lucide-react';
import { Playfair_Display } from 'next/font/google';
import { searchPapers } from '@/lib/api/semanticScholar';
import { SemanticScholarPaper } from '@/lib/types';

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], weight: ['400', '700'] });

const CURATED_COLLECTIONS = [
  "Theoretical Physics",
  "Renaissance Art",
  "Cognitive Science",
  "Quantum Computing",
  "Ancient Philosophy"
];

const MOCK_PAPERS = [
  { id: 'mock-1', title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, citations: 124000, abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...', insights: ['Introduced the Transformer architecture.', 'Self-attention mechanism replaces recurrence.', 'Highly parallelizable.'] },
  { id: 'mock-2', title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.', year: 2018, citations: 89000, abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers...', insights: ['Bidirectional context modeling.', 'Masked Language Modeling objective.', 'State-of-the-art on 11 NLP tasks.'] },
  { id: 'mock-3', title: 'Language Models are Few-Shot Learners', authors: 'Brown et al.', year: 2020, citations: 52000, abstract: 'We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches...', insights: ['Introduced GPT-3 (175B parameters).', 'In-context learning without fine-tuning.', 'Emergent abilities at scale.'] },
  { id: 'mock-4', title: 'Chinchilla: Training Compute-Optimal Large Language Models', authors: 'Hoffmann et al.', year: 2022, citations: 2100, abstract: 'We investigate the optimal model size and number of tokens for training a transformer language model under a given compute budget...', insights: ['Model size and training data should scale equally.', 'Provided new scaling laws.', 'Chinchilla (70B) outperforms Gopher (280B).'] },
];

// Animation variants for stagger effects
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export type MappedPaper = {
  id: string;
  title: string;
  authors: string;
  year: number | string;
  citations: number;
  abstract: string;
  insights: string[];
};

export default function LanternApp() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [selectedPaper, setSelectedPaper] = useState<MappedPaper | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  // API State
  const [papers, setPapers] = useState<MappedPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setView('dashboard');
    setIsLoading(true);
    setError(null);
    setSelectedPaper(null);

    try {
      const results = await searchPapers(searchQuery);

      const mappedResults: MappedPaper[] = results.map(paper => {
        // Format authors
        let authorString = 'Unknown Authors';
        if (paper.authors && paper.authors.length > 0) {
          authorString = paper.authors.length <= 3
            ? paper.authors.map(a => a.name).join(', ')
            : `${paper.authors[0].name} et al.`;
        }

        // Generate mock insights if abstract exists, else generic
        let insights = ['No detailed insights available for this paper.'];
        if (paper.abstract) {
          insights = [
            `Discusses concepts related to "${searchQuery}".`,
            'Proposes novel methodologies in the field.',
            'Contributes to the broader understanding of the topic.'
          ];
        }

        return {
          id: paper.paperId || Math.random().toString(),
          title: paper.title || 'Untitled Paper',
          authors: authorString,
          year: paper.year || 'N/A',
          citations: paper.citationCount || 0,
          abstract: paper.abstract || 'No abstract available for this paper.',
          insights
        };
      });

      setPapers(mappedResults);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'RATE_LIMIT') {
        setError('Semantic Scholar API rate limit reached (too many requests). Falling back to cached library records.');
      } else {
        setError('Failed to retrieve knowledge. The archives are currently inaccessible. Displaying offline records.');
      }
      // Provide fallback mock data so the app remains usable and the UI looks good
      setPapers(MOCK_PAPERS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden selection:bg-amber-500/30 relative">
      {/* Lantern Butter Paper Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-0 h-[400px] w-[400px] rounded-full bg-amber-400/10 blur-[100px] mix-blend-screen"
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 200,
        }}
        transition={{ type: "spring", damping: 40, stiffness: 200, mass: 0.5 }}
      />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col min-h-screen relative"
          >
            {/* Top-right subtle element if desired */}
            <div className="absolute top-8 right-8 text-amber-500/30">
              <BookOpen size={24} />
            </div>

            {/* Main Centered Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto -mt-20">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center w-full"
              >
                <h1
                  className={`text-6xl md:text-7xl font-bold tracking-tight text-[#f4af25] mb-2 italic ${playfair.className}`}
                >
                  Lantern
                </h1>
                <p className="text-[#f4af25]/50 text-sm tracking-[0.2em] uppercase font-light mb-12">
                  The Architect of Knowledge
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative group w-full max-w-2xl mx-auto z-20">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl transition-all duration-700 group-hover:bg-amber-500/30 group-focus-within:bg-amber-500/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"></div>

                  <div className="relative flex items-center bg-[#141414]/80 backdrop-blur-xl border border-zinc-800/80 focus-within:border-amber-500/60 rounded-full overflow-hidden transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <div className="pl-6 pr-4 py-5 text-amber-500 transition-transform group-focus-within:scale-110 duration-300">
                      <Search size={22} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search papers, authors, or concepts..."
                      className="w-full bg-transparent text-zinc-100 text-lg md:text-xl placeholder:text-zinc-600 focus:outline-none py-5 pr-6 font-light"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="hidden"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Curated Collections */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-16 flex flex-col items-center"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-6 font-semibold">Curated Collections</span>
                  <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl">
                    {CURATED_COLLECTIONS.map((collection, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setQuery(collection); executeSearch(collection); }}
                        className="px-5 py-2 rounded-full border border-zinc-700 text-zinc-400 text-sm hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        {collection}
                      </button>
                    ))}
                  </div>
                </motion.div>

              </motion.div>
            </div>

            {/* Bottom Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-8 left-0 right-0 flex justify-center"
            >
              <nav className="flex items-center space-x-2 bg-[#141414]/90 backdrop-blur-xl border border-zinc-800/80 rounded-full px-2 py-2 shadow-2xl">
                {[
                  { icon: Flame, label: 'Sanctum', active: true },
                  { icon: Library, label: 'Library' },
                  { icon: Network, label: 'Synthesis' },
                  { icon: History, label: 'Echoes' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all duration-300 ${item.active
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                  >
                    <item.icon size={18} className={item.active ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col h-screen overflow-hidden bg-[#0A0A0A] relative"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            {/* Header / Search Bar */}
            <header className="flex-none flex items-center px-8 py-5 border-b border-zinc-800/50 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0">
              <h2
                className={`text-3xl font-bold italic tracking-tight text-[#f4af25] cursor-pointer mr-12 transition-transform hover:scale-[1.02] ${playfair.className}`}
                onClick={() => {
                  setView('landing');
                  setQuery('');
                  setSelectedPaper(null);
                }}
              >
                Lantern
              </h2>
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
                <div className="absolute inset-0 bg-amber-500/5 rounded-xl blur-lg transition-all duration-500 opacity-0 group-focus-within:opacity-100"></div>
                <div className="relative flex items-center bg-[#141414] border border-zinc-800 focus-within:border-amber-500/50 rounded-xl overflow-hidden transition-all duration-300">
                  <div className="pl-4 pr-3 py-3 text-amber-500/70 group-focus-within:text-amber-500">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search context..."
                    className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none py-3 pr-4 font-light text-base"
                  />
                </div>
              </form>
              <div className="ml-auto flex items-center space-x-4">
                <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors">
                  <Library size={18} />
                </button>
              </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative z-10">
              {/* Cards List Pane */}
              <motion.div
                layout
                initial={false}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full overflow-y-auto custom-scrollbar ${selectedPaper ? 'w-full lg:w-[55%] border-r border-zinc-800/50' : 'w-full max-w-5xl mx-auto'
                  }`}
              >
                <div className={`p-8 pb-32 transition-all duration-300 ${!selectedPaper && 'pt-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-end justify-between"
                  >
                    <div>
                      <h3 className={`text-3xl text-zinc-100 mb-2 ${playfair.className}`}>
                        {query ? `Synthesis for "${query}"` : "Recent Echoes"}
                      </h3>
                      <p className="text-zinc-500 font-light">
                        {isLoading ? 'Searching the archives...' : `${papers.length} volumes found in the repository`}
                      </p>
                    </div>
                  </motion.div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-8">
                      {error}
                    </div>
                  )}

                  <motion.div
                    key={isLoading ? 'loading' : 'results'}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    {isLoading ? (
                      // Skeleton Loaders
                      [1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={`skeleton-${i}`}
                          className="p-6 pl-8 rounded-2xl bg-[#101010] border border-zinc-800/40 relative overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full"
                            animate={{ translateX: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: i * 0.1 }}
                          />
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div className="h-6 bg-zinc-800/50 rounded w-2/3"></div>
                            <div className="flex gap-2">
                              <div className="h-6 w-12 bg-zinc-800/50 rounded"></div>
                              <div className="h-6 w-16 bg-zinc-800/50 rounded"></div>
                            </div>
                          </div>
                          <div className="h-4 bg-zinc-800/30 rounded w-1/3 mb-5"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-zinc-800/20 rounded w-full"></div>
                            <div className="h-3 bg-zinc-800/20 rounded w-5/6"></div>
                          </div>
                        </motion.div>
                      ))
                    ) : papers.map((paper) => {
                      const isSelected = selectedPaper?.id === paper.id;
                      return (
                        <motion.div
                          variants={itemVariants}
                          key={paper.id}
                          onClick={() => setSelectedPaper(paper)}
                          className={`relative group cursor-pointer rounded-2xl border transition-all duration-400 overflow-hidden ${isSelected
                            ? 'bg-[#141414] border-amber-500/30 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20 scale-[1.01] z-10'
                            : 'bg-[#101010] border-zinc-800/60 hover:border-zinc-700 hover:bg-[#121212] hover:shadow-xl'
                            }`}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.8)] z-10"></div>
                          )}
                          <div className="p-6 pl-8">
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <h4 className={`text-xl font-medium leading-tight transition-colors duration-300 ${isSelected ? 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]' : 'text-zinc-200 group-hover:text-amber-400'}`}>
                                {paper.title}
                              </h4>
                              <div className="flex items-center space-x-3 shrink-0 text-xs font-mono text-zinc-500">
                                <span className={`px-2.5 py-1 rounded-md transition-colors ${isSelected ? 'bg-amber-500/10 text-amber-500/80 border border-amber-500/20' : 'bg-zinc-800/40 border border-zinc-800'}`}>
                                  {paper.year}
                                </span>
                                <span className="flex items-center">
                                  <Quote size={12} className={`mr-1.5 ${isSelected ? 'text-amber-500/50' : 'text-zinc-600'}`} />
                                  {paper.citations.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <p className="text-zinc-400 text-sm mb-4 font-light">
                              {paper.authors}
                            </p>

                            <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed font-light">
                              {paper.abstract}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>

              {/* AI Reading Panel Pane */}
              <AnimatePresence>
                {selectedPaper && (
                  <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="hidden lg:flex flex-col absolute right-0 top-0 bottom-0 w-[45%] bg-[#0f0f0f]/80 backdrop-blur-3xl shrink-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-20 border-l border-zinc-800/80"
                  >
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>

                    <div className="px-8 py-5 border-b border-zinc-800/40 flex items-center justify-between sticky top-0 bg-[#0f0f0f]/60 backdrop-blur-xl z-20">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                          <Flame size={16} className="text-amber-500" />
                        </div>
                        <h3 className="text-xs font-semibold text-amber-500 tracking-[0.2em] uppercase">
                          AI Reading Assistant
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedPaper(null)}
                        className="p-2 rounded-full hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="px-10 py-8 overflow-y-auto flex-1 pb-32 custom-scrollbar relative z-10">
                      <div className="mb-10">
                        <div className="flex items-center space-x-3 mb-6 text-xs font-mono text-zinc-500">
                          <span className="bg-[#1a1a1a] border border-zinc-800 px-3 py-1 rounded-md text-zinc-300">
                            Volume: {selectedPaper.year}
                          </span>
                          <span className="bg-[#1a1a1a] border border-zinc-800 px-3 py-1 rounded-md text-zinc-300 flex items-center">
                            Impact: {selectedPaper.citations.toLocaleString()} citations
                          </span>
                        </div>
                        <h2 className={`text-4xl text-zinc-50 leading-tight mb-5 drop-shadow-lg ${playfair.className}`}>
                          {selectedPaper.title}
                        </h2>
                        <h3 className="text-amber-500/90 font-medium text-lg flex items-center">
                          <Users size={16} className="mr-2 opacity-70" />
                          {selectedPaper.authors}
                        </h3>
                      </div>

                      <div className="space-y-12">
                        <section>
                          <h4 className="text-sm font-semibold text-zinc-100 uppercase tracking-widest mb-5 flex items-center">
                            <span className="w-8 h-[1px] bg-amber-500/50 mr-3"></span>
                            Key Insights Extraction
                          </h4>
                          <div className="bg-[#141414]/50 border border-zinc-800/50 rounded-2xl p-6 shadow-inner">
                            <ul className="space-y-4">
                              {selectedPaper.insights.map((insight, idx) => (
                                <li key={idx} className="flex items-start text-zinc-300 group">
                                  <div className="mt-1 mr-4 bg-amber-500/20 rounded-full p-1 group-hover:bg-amber-500/30 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                                  </div>
                                  <span className="leading-relaxed text-base font-light">{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </section>

                        <section>
                          <h4 className="text-sm font-semibold text-zinc-100 uppercase tracking-widest mb-5 flex items-center">
                            <span className="w-8 h-[1px] bg-amber-500/50 mr-3"></span>
                            Abstract Analysis
                          </h4>
                          <p className="text-zinc-400 leading-relaxed text-base font-light">
                            {selectedPaper.abstract}
                            <span className="inline-flex items-center justify-center ml-2 border-b border-amber-500/30 text-amber-500/80 hover:text-amber-400 hover:border-amber-400 cursor-pointer transition-all pb-0.5">
                              Reveal full text <ArrowUpRight size={14} className="ml-1" />
                            </span>
                          </p>
                        </section>
                      </div>
                    </div>

                    {/* Floating Actions inside Panel */}
                    <div className="absolute bottom-6 inset-x-10 z-20 flex justify-end">
                      <button className="flex items-center space-x-2 bg-amber-500 text-amber-950 px-6 py-3 rounded-full font-semibold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:bg-amber-400 transition-all transform hover:-translate-y-0.5">
                        <span>Save to Library</span>
                        <BookOpen size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile overlays and responsive elements go here if needed... simplified for brevity */}
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(63, 63, 70, 0.4);
                border-radius: 10px;
              }
              .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                background-color: rgba(63, 63, 70, 0.8);
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
