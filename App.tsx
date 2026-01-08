import React, { useEffect, useState, useMemo } from 'react';
import { 
  Stage, 
  Candidate, 
  ColumnDefinition 
} from './types';
import { 
  getCandidates, 
  addCandidate, 
  updateCandidateStage, 
  deleteCandidate,
  resetData
} from './services/storageService';
import { CandidateCard } from './components/CandidateCard';
import { AddCandidateModal } from './components/AddCandidateModal';
import { 
  LayoutDashboard, 
  Users, 
  Plus, 
  RefreshCw,
  Coffee,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

const COLUMNS: ColumnDefinition[] = [
  { 
    id: Stage.WAITING, 
    title: '等待大廳', 
    color: 'bg-slate-100 border-slate-200',
    icon: <Coffee className="text-slate-500" size={18} />
  },
  { 
    id: Stage.IN_CHINESE, 
    title: '中文面試中', 
    color: 'bg-blue-50 border-blue-200',
    icon: <MessageSquare className="text-blue-500" size={18} />
  },
  { 
    id: Stage.IN_ENGLISH, 
    title: '英文面試中', 
    color: 'bg-purple-50 border-purple-200',
    icon: <MessageSquare className="text-purple-500" size={18} />
  },
  { 
    id: Stage.COMPLETED, 
    title: '已完成', 
    color: 'bg-green-50 border-green-200',
    icon: <CheckCircle className="text-green-600" size={18} />
  },
];

const App: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Load data and set up synchronization
  useEffect(() => {
    // Initial load
    setCandidates(getCandidates());

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = () => {
      setCandidates(getCandidates());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Update time every minute to refresh UI relative times if needed
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(timer);
    };
  }, []);

  const handleAddCandidate = (name: string, role: string) => {
    addCandidate(name, role);
    setCandidates(getCandidates()); // Force local update immediately
  };

  const handleMoveCandidate = (id: string, stage: Stage) => {
    updateCandidateStage(id, stage);
    setCandidates(getCandidates());
  };

  const handleDeleteCandidate = (id: string) => {
    if (window.confirm('確定要移除這位面試者嗎？')) {
      deleteCandidate(id);
      setCandidates(getCandidates());
    }
  };

  const handleReset = () => {
    if (window.confirm('確定要重置所有資料嗎？')) {
      resetData();
      setCandidates(getCandidates());
    }
  };

  // Group candidates by stage
  const columnsData = useMemo(() => {
    const groups: Record<string, Candidate[]> = {
      [Stage.WAITING]: [],
      [Stage.IN_CHINESE]: [],
      [Stage.IN_ENGLISH]: [],
      [Stage.COMPLETED]: [],
    };

    candidates.forEach(c => {
      if (groups[c.currentStage]) {
        groups[c.currentStage].push(c);
      }
    });

    // Sort by last updated (newest first for waiting, etc)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.lastUpdated - a.lastUpdated);
    });

    return groups;
  }, [candidates]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">面試狀態看板</h1>
              <p className="text-xs text-slate-500 hidden sm:block">即時同步 • 多裝置支援</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="重置資料"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">新增面試者</span>
              <span className="sm:hidden">新增</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full min-w-[1000px] lg:min-w-full p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-4 gap-6 h-full">
            {COLUMNS.map((col) => {
              const items = columnsData[col.id];
              return (
                <div key={col.id} className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
                  {/* Column Header */}
                  <div className={`flex items-center justify-between p-3 rounded-t-xl border-t border-x ${col.color} bg-white bg-opacity-60 backdrop-blur-sm`}>
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      {col.icon}
                      {col.title}
                    </div>
                    <span className="bg-white/80 px-2 py-0.5 rounded-md text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                      {items.length}
                    </span>
                  </div>

                  {/* Column Body */}
                  <div className={`flex-1 p-3 overflow-y-auto border-x border-b rounded-b-xl ${col.color} bg-opacity-30 scrollbar-hide`}>
                    <div className="flex flex-col gap-3">
                      {items.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-400 italic text-sm border-2 border-dashed border-slate-200 rounded-lg bg-white/30">
                          尚無資料
                        </div>
                      ) : (
                        items.map(candidate => (
                          <CandidateCard 
                            key={candidate.id} 
                            candidate={candidate} 
                            onMove={handleMoveCandidate}
                            onDelete={handleDeleteCandidate}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Mobile View Disclaimer (visible only on very small screens, though CSS grid handles tablets well) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 text-center text-xs text-slate-400">
        向右滑動查看更多狀態欄位
      </div>

      <AddCandidateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddCandidate}
      />
    </div>
  );
};

export default App;