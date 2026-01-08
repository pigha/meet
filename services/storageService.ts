import { Candidate, Stage } from '../types';

const STORAGE_KEY = 'interview_candidates_v1';

// Initial mock data
const INITIAL_DATA: Candidate[] = [
  {
    id: '1',
    name: '王小明',
    role: 'Frontend Engineer',
    checkInTime: Date.now() - 3600000,
    currentStage: Stage.WAITING,
    hasCompletedChinese: false,
    hasCompletedEnglish: false,
    lastUpdated: Date.now(),
  },
  {
    id: '2',
    name: '陳雅婷',
    role: 'Product Manager',
    checkInTime: Date.now() - 7200000,
    currentStage: Stage.IN_CHINESE,
    hasCompletedChinese: false,
    hasCompletedEnglish: true, // Already done English
    lastUpdated: Date.now(),
  },
  {
    id: '3',
    name: '張偉',
    role: 'Backend Engineer',
    checkInTime: Date.now() - 1800000,
    currentStage: Stage.IN_ENGLISH,
    hasCompletedChinese: false,
    hasCompletedEnglish: false,
    lastUpdated: Date.now(),
  }
];

export const getCandidates = (): Candidate[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

export const saveCandidates = (candidates: Candidate[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  // Dispatch a custom event so other components/tabs can react immediately
  window.dispatchEvent(new Event('storage'));
};

export const addCandidate = (name: string, role: string) => {
  const candidates = getCandidates();
  const newCandidate: Candidate = {
    id: crypto.randomUUID(),
    name,
    role,
    checkInTime: Date.now(),
    currentStage: Stage.WAITING,
    hasCompletedChinese: false,
    hasCompletedEnglish: false,
    lastUpdated: Date.now(),
  };
  saveCandidates([...candidates, newCandidate]);
};

export const updateCandidateStage = (id: string, newStage: Stage) => {
  const candidates = getCandidates();
  const updated = candidates.map(c => {
    if (c.id === id) {
      // Logic to auto-mark completion based on *leaving* a stage
      let updates: Partial<Candidate> = { currentStage: newStage, lastUpdated: Date.now() };
      
      // If moving FROM Chinese TO somewhere else, mark Chinese as done
      if (c.currentStage === Stage.IN_CHINESE && newStage !== Stage.IN_CHINESE) {
        updates.hasCompletedChinese = true;
      }
      // If moving FROM English TO somewhere else, mark English as done
      if (c.currentStage === Stage.IN_ENGLISH && newStage !== Stage.IN_ENGLISH) {
        updates.hasCompletedEnglish = true;
      }

      // If manually moving TO Completed, ensure flags are set (optional, strictly speaking depending on business logic)
      if (newStage === Stage.COMPLETED) {
        // Assume if manually moved to completed, they are done.
      }

      return { ...c, ...updates };
    }
    return c;
  });
  saveCandidates(updated);
};

export const deleteCandidate = (id: string) => {
  const candidates = getCandidates();
  saveCandidates(candidates.filter(c => c.id !== id));
};

export const resetData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  window.dispatchEvent(new Event('storage'));
};