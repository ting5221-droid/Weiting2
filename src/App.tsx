import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  History, 
  Flower2, 
  Plus, 
  Trash2,
  Trophy, 
  Calendar,
  TrendingUp,
  Leaf
} from 'lucide-react';
import { GameState, ReadingLog, GrowthStage } from './types';
import { FLOWER_TYPES } from './constants';

const STORAGE_KEY = 'reading_garden_state';

const INITIAL_STATE: GameState = {
  currentFlower: null,
  history: [],
  logs: [],
  totalPages: 0,
};

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [inputPages, setInputPages] = useState<string>('');
  const [view, setView] = useState<'garden' | 'history' | 'stats'>('garden');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentFlowerType = useMemo(() => {
    if (!state.currentFlower) return null;
    return FLOWER_TYPES.find(f => f.id === state.currentFlower?.typeId) || FLOWER_TYPES[0];
  }, [state.currentFlower]);

  const growthProgress = useMemo(() => {
    if (!state.currentFlower || !currentFlowerType) return 0;
    return Math.min(100, (state.currentFlower.pagesInvested / currentFlowerType.requiredPages) * 100);
  }, [state.currentFlower, currentFlowerType]);

  const currentStage = useMemo((): GrowthStage => {
    if (growthProgress < 10) return 'seed';
    if (growthProgress < 40) return 'sprout';
    if (growthProgress < 80) return 'bud';
    return 'bloom';
  }, [growthProgress]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const pages = parseInt(inputPages);
    if (isNaN(pages) || pages <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    const newLog: ReadingLog = { date: today, pages };

    let newState = { ...state };
    newState.logs = [newLog, ...newState.logs];
    newState.totalPages += pages;

    if (!newState.currentFlower) {
      const nextType = FLOWER_TYPES[0]; 
      newState.currentFlower = {
        id: crypto.randomUUID(),
        typeId: nextType.id,
        pagesInvested: pages,
        plantedAt: today,
      };
    } else {
      newState.currentFlower = {
        ...newState.currentFlower,
        pagesInvested: newState.currentFlower.pagesInvested + pages,
      };
    }

    const type = FLOWER_TYPES.find(f => f.id === newState.currentFlower?.typeId);
    if (type && newState.currentFlower.pagesInvested >= type.requiredPages) {
      newState.currentFlower.bloomedAt = today;
      newState.history = [newState.currentFlower, ...newState.history];
      newState.currentFlower = null;
    }

    setState(newState);
    setInputPages('');
  };

  const startNewFlower = (typeId: string) => {
    if (state.currentFlower) return;
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      currentFlower: {
        id: crypto.randomUUID(),
        typeId,
        pagesInvested: 0,
        plantedAt: today,
      }
    }));
  };

  const getDayStreak = () => {
    if (state.logs.length === 0) return 0;
    const uniqueDays = Array.from(new Set(state.logs.map(l => l.date))).sort().reverse() as string[];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const d1 = new Date(uniqueDays[i]);
      const d2 = new Date(uniqueDays[i+1]);
      const diff = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };

  return (
    <div className="min-h-screen bg-sky-100 text-slate-800 font-sans selection:bg-blue-200">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b-4 border-emerald-400">
        <div className="max-w-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-200">
              🌱
            </div>
            <div>
              <h1 className="text-2xl font-black text-emerald-900 leading-none uppercase">READ & BLOOM</h1>
              <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Reading Garden</span>
            </div>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-full text-xs font-bold">
            <button 
              onClick={() => setView('garden')}
              className={`px-4 py-2 rounded-full transition-all ${view === 'garden' ? 'bg-emerald-500 shadow-md text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              花園
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-4 py-2 rounded-full transition-all ${view === 'history' ? 'bg-emerald-500 shadow-md text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              回憶
            </button>
            <button 
              onClick={() => setView('stats')}
              className={`px-4 py-2 rounded-full transition-all ${view === 'stats' ? 'bg-emerald-500 shadow-md text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              成就
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {view === 'garden' && (
            <motion.div 
              key="garden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="aspect-square relative flex items-center justify-center bg-gradient-to-b from-sky-50 to-emerald-50 rounded-[40px] border-b-8 border-r-8 border-emerald-200 overflow-hidden shadow-inner">
                {/* Sunlight effect */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-30" />
                
                <div className="relative text-center">
                  <AnimatePresence mode="wait">
                    {state.currentFlower ? (
                      <motion.div
                        key={state.currentFlower.id + currentStage}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-[140px] leading-none mb-6 drop-shadow-2xl select-none transform hover:scale-110 transition-transform cursor-pointer">
                          {currentFlowerType?.stages[currentStage]}
                        </span>
                        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border-2 border-emerald-100">
                          <p className="text-sm font-black text-emerald-900 uppercase tracking-wider">
                            {currentFlowerType?.name} · {Math.round(growthProgress)}%
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 px-10"
                      >
                        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                          <Flower2 className="w-10 h-10 text-emerald-500 opacity-60" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-emerald-900 text-center">你的花園需要一粒種子</h3>
                          <p className="text-sm font-bold text-emerald-600 leading-relaxed text-center uppercase tracking-wide">
                            選擇一朵想要種植的花，透過閱讀來澆灌它。
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-8">
                          {FLOWER_TYPES.slice(0, 3).map(type => (
                            <button
                              key={type.id}
                              onClick={() => startNewFlower(type.id)}
                              className="p-4 bg-white border-4 border-white rounded-[24px] text-3xl shadow-lg hover:border-emerald-400 hover:scale-105 transition-all group active:scale-95"
                            >
                              <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                                {type.stages.bloom}
                              </div>
                              <div className="text-[10px] font-black mt-2 uppercase tracking-widest text-emerald-600">
                                {type.requiredPages}P
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {state.currentFlower && (
                  <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-3">
                    <div className="h-4 w-full bg-white/50 rounded-full overflow-hidden border-2 border-white">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${growthProgress}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-emerald-800 uppercase tracking-[2px]">
                      <span className="bg-white/60 px-2 py-0.5 rounded-md">已讀 {state.currentFlower.pagesInvested} 頁</span>
                      <span className="bg-white/60 px-2 py-0.5 rounded-md">目標: {currentFlowerType?.requiredPages} 頁</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-xl border-t-8 border-blue-400 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">📖 日常閱讀進度</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">紀錄今日收穫，為花園注入能量</p>
                </div>
                
                <form onSubmit={handleAddLog} className="flex gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <input
                      type="number"
                      value={inputPages}
                      onChange={(e) => setInputPages(e.target.value)}
                      placeholder="今天讀了多少頁？"
                      className="w-full bg-blue-50 border-4 border-transparent rounded-[20px] py-4 pl-14 pr-4 focus:outline-none focus:border-blue-400 text-lg font-bold text-blue-900 transition-all placeholder:text-blue-200"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-blue-500 text-white px-8 rounded-[20px] font-black text-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center"
                  >
                    澆水 💧
                  </button>
                </form>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-emerald-50 p-6 rounded-2xl text-center border-b-4 border-emerald-200">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">連續閱讀</p>
                    <p className="text-3xl font-black text-emerald-600">{getDayStreak()} <span className="text-sm">DAY</span></p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl text-center border-b-4 border-blue-200">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">累計總頁數</p>
                    <p className="text-3xl font-black text-blue-600">{state.totalPages} <span className="text-sm">P</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-emerald-900 uppercase">已綻放的回憶</h2>
                <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
                  {state.history.length} 朵收藏
                </span>
              </div>

              {state.history.length === 0 ? (
                <div className="text-center py-24 bg-white/40 rounded-[40px] border-4 border-dashed border-emerald-200">
                  <p className="font-bold text-emerald-600 uppercase tracking-widest">花園中尚無綻放的回憶，快去閱讀吧！</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {state.history.map(flower => {
                    const type = FLOWER_TYPES.find(f => f.id === flower.typeId);
                    return (
                      <div key={flower.id} className="bg-white p-8 rounded-[32px] shadow-xl border-t-8 border-emerald-400 hover:scale-105 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-[80px] -mr-4 -mt-4 opacity-40 group-hover:bg-emerald-100 transition-colors" />
                        <div className="text-6xl mb-6 transform group-hover:scale-125 transition-transform text-center">
                          {type?.stages.bloom}
                        </div>
                        <h4 className="text-xl font-black text-slate-800 text-center uppercase mb-2 tracking-tight">{type?.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
                          於 {flower.plantedAt} 播下種子
                        </p>
                        <div className="flex items-center justify-center gap-2 bg-emerald-50 py-2 rounded-xl">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-black text-emerald-600">{flower.pagesInvested} 頁</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-black text-slate-800 border-l-8 border-pink-400 pl-6 uppercase">花園成長數據</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-xl border-t-8 border-pink-400 flex flex-col items-center">
                  <div className="p-4 bg-pink-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="w-8 h-8 text-pink-500" />
                  </div>
                  <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2">連讀天數</h4>
                  <p className="text-4xl font-black text-pink-600">{getDayStreak()} <span className="text-sm">DAY</span></p>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-xl border-t-8 border-indigo-400 flex flex-col items-center">
                  <div className="p-4 bg-indigo-50 rounded-2xl mb-4">
                    <TrendingUp className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">平均日讀</h4>
                  <p className="text-4xl font-black text-indigo-600">
                    {state.logs.length > 0 
                      ? Math.round(state.totalPages / Array.from(new Set(state.logs.map(l => l.date))).length)
                      : 0
                    } <span className="text-sm">P</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[32px] shadow-xl border-t-8 border-yellow-400 overflow-hidden">
                <div className="p-8 border-b-2 border-yellow-50 bg-yellow-50/30 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800 uppercase flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                    成長紀錄歷程
                  </h3>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                </div>
                <div className="p-8 space-y-4">
                  {state.logs.slice(0, 5).map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-yellow-200 transition-all">
                      <div>
                        <p className="font-black text-slate-700">{log.date}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">能量注入紀錄</p>
                      </div>
                      <div className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-100">
                        +{log.pages} P
                      </div>
                    </div>
                  ))}
                  {state.logs.length === 0 && (
                    <p className="text-sm font-bold text-slate-400 text-center py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 uppercase tracking-widest">目前尚無任何紀錄</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={() => {
                    if (window.confirm('確定要清除所有紀錄嗎？此動作無法復原。')) {
                      setState(INITIAL_STATE);
                      localStorage.removeItem(STORAGE_KEY);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  清除所有資料
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
