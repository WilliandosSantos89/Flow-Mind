export interface SMARTSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: 1 | 2 | 3 | 4; // 1: Urgente & Importante, 2: Importante & Não Urgente, 3: Urgente & Não Importante, 4: Não Urgente & Não Importante
  isSapo: boolean; // Sapo do Dia (only one active target per day typically)
  estimatedPomodoros: number;
  completedPomodoros: number;
  smartSubtasks: SMARTSubtask[];
  completed: boolean;
  scheduledDate?: string; // YYYY-MM-DD
  timeBlockStart?: string; // HH:MM
  timeBlockEnd?: string; // HH:MM
  projectId?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  metaId: string;
  color: string;
}

export interface SMARTMeta {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  completed: boolean;
}

export interface ProductivityLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  completedTasksCount: number;
  totalPomodorosCount: number;
  sapoCompleted: boolean;
  reflection1: string; // O que correu bem hoje?
  reflection2: string; // Onde perdi foco ou tempo?
  reflection3: string; // Qual é o plano de amanhã?
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
