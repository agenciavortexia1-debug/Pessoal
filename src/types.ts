export interface BodyLog {
  id: number;
  date: string;
  sleep_hours: number;
  sleep_quality: number;
  training_done: number;
  training_type: string;
  energy_level: number;
  activity_level: number;
}

export interface MindLog {
  id: number;
  date: string;
  mood: number;
  anxiety: number;
  stress: number;
  focus: number;
  journal: string;
}

export interface FinanceLog {
  id: number;
  date: string;
  income: number;
  expenses: number;
  debts: number;
  installments: number;
}

export interface Project {
  id: number;
  name: string;
  weekly_goal_hours: number;
  created_at: string;
}

export interface DisciplineLog {
  id: number;
  date: string;
  project_id: number;
  project_name?: string;
  minutes_invested: number;
  focus_level: number;
}

export interface InboxItem {
  id: number;
  content: string;
  type: 'idea' | 'worry' | 'thought' | 'task';
  created_at: string;
}

export interface DashboardData {
  body: BodyLog[];
  mind: MindLog[];
  finance: FinanceLog[];
  discipline: { date: string; total_minutes: number; avg_focus: number }[];
}
