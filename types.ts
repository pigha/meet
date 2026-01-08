import React from 'react';

export enum Stage {
  WAITING = 'WAITING',
  IN_CHINESE = 'IN_CHINESE',
  IN_ENGLISH = 'IN_ENGLISH',
  COMPLETED = 'COMPLETED',
  BREAK = 'BREAK' // Interim state if needed, or just staying in waiting
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  checkInTime: number;
  currentStage: Stage;
  hasCompletedChinese: boolean;
  hasCompletedEnglish: boolean;
  lastUpdated: number;
}

export interface ColumnDefinition {
  id: Stage;
  title: string;
  color: string;
  icon?: React.ReactNode;
}