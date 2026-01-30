export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  reminder_at?: string;
  completed: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inspiration {
  id: string;
  content: string;
  tags: string[];
  created_at: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  reminder_at?: string;
}

export interface UpdateTodoRequest {
  id: string;
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  due_date?: string;
  reminder_at?: string;
  completed?: boolean;
}

export interface CreateInspirationRequest {
  content: string;
  tags: string[];
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  archived: number;
}

export type ViewMode = 'todos' | 'inspirations' | 'archived';
