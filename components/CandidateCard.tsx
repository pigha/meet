import React from 'react';
import { Candidate, Stage } from '../types';
import { User, Clock, CheckCircle2, Languages, ArrowRight, X } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  onMove: (id: string, stage: Stage) => void;
  onDelete: (id: string) => void;
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
};

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onMove, onDelete }) => {
  const isDone = candidate.currentStage === Stage.COMPLETED;

  // Calculate available actions based on current state and history
  const renderActions = () => {
    if (isDone) return null;

    const buttons = [];

    // If not in Chinese and hasn't done Chinese
    if (candidate.currentStage !== Stage.IN_CHINESE && !candidate.hasCompletedChinese) {
      buttons.push(
        <button
          key="to-cn"
          onClick={() => onMove(candidate.id, Stage.IN_CHINESE)}
          className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <Languages size={14} /> 中文面試
        </button>
      );
    }

    // If not in English and hasn't done English
    if (candidate.currentStage !== Stage.IN_ENGLISH && !candidate.hasCompletedEnglish) {
      buttons.push(
        <button
          key="to-en"
          onClick={() => onMove(candidate.id, Stage.IN_ENGLISH)}
          className="flex-1 bg-purple-100 text-purple-700 hover:bg-purple-200 py-2 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <Languages size={14} /> 英文面試
        </button>
      );
    }

    // If currently interviewing, allow finishing
    if (candidate.currentStage === Stage.IN_CHINESE || candidate.currentStage === Stage.IN_ENGLISH) {
       // Logic: Where to go next? 
       // If other is pending -> Go to Waiting (Transition) or directly there? 
       // To keep it simple: "Finish Current" sends them to WAITING so the coordinator can route them, 
       // OR if both done -> COMPLETED.
       
       const otherDone = candidate.currentStage === Stage.IN_CHINESE ? candidate.hasCompletedEnglish : candidate.hasCompletedChinese;
       
       buttons.push(
         <button
           key="finish"
           onClick={() => onMove(candidate.id, otherDone ? Stage.COMPLETED : Stage.WAITING)}
           className="w-full bg-green-100 text-green-700 hover:bg-green-200 py-2 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1"
         >
           <CheckCircle2 size={14} /> {otherDone ? '全部完成' : '結束面試 (回大廳)'}
         </button>
       );
    }
    
    // Manual override to complete if needed
    if (candidate.currentStage === Stage.WAITING && candidate.hasCompletedChinese && candidate.hasCompletedEnglish) {
        buttons.push(
            <button
              key="complete-all"
              onClick={() => onMove(candidate.id, Stage.COMPLETED)}
              className="w-full bg-slate-800 text-white hover:bg-slate-700 py-2 px-3 rounded-md text-sm font-semibold transition-colors"
            >
              標記為完成
            </button>
        );
    }

    return (
      <div className="flex gap-2 mt-3">
        {buttons}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
      <button 
        onClick={() => onDelete(candidate.id)}
        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="移除"
      >
        <X size={16} />
      </button>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {candidate.name}
            {isDone && <CheckCircle2 className="text-green-500" size={16} />}
          </h3>
          <p className="text-xs text-slate-500 font-medium">{candidate.role}</p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
          <Clock size={12} />
          {formatTime(candidate.checkInTime)}
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${candidate.hasCompletedChinese ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          中文 {candidate.hasCompletedChinese ? '✓' : ''}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${candidate.hasCompletedEnglish ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          英文 {candidate.hasCompletedEnglish ? '✓' : ''}
        </span>
      </div>

      {renderActions()}
    </div>
  );
};