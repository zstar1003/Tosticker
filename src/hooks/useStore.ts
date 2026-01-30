import { create } from 'zustand';
import { Inspiration, Todo, TodoStats, ViewMode } from '@/types';
import { inspirationApi, todoApi } from '@/utils/api';

interface AppState {
  // View state
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  
  // Todos
  todos: Todo[];
  archivedTodos: Todo[];
  todoStats: TodoStats | null;
  isLoadingTodos: boolean;
  loadTodos: () => Promise<void>;
  loadArchivedTodos: () => Promise<void>;
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  removeTodo: (id: string) => void;
  completeTodo: (id: string) => void;
  refreshStats: () => Promise<void>;
  
  // Inspirations
  inspirations: Inspiration[];
  isLoadingInspirations: boolean;
  loadInspirations: () => Promise<void>;
  addInspiration: (inspiration: Inspiration) => void;
  removeInspiration: (id: string) => void;
  
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // View state
  currentView: 'todos',
  setCurrentView: (view) => set({ currentView: view }),
  
  // Todos
  todos: [],
  archivedTodos: [],
  todoStats: null,
  isLoadingTodos: false,
  
  loadTodos: async () => {
    set({ isLoadingTodos: true });
    try {
      const todos = await todoApi.getAll(false);
      set({ todos });
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      set({ isLoadingTodos: false });
    }
  },
  
  loadArchivedTodos: async () => {
    set({ isLoadingTodos: true });
    try {
      const todos = await todoApi.getAll(true);
      set({ archivedTodos: todos });
    } catch (error) {
      console.error('Failed to load archived todos:', error);
    } finally {
      set({ isLoadingTodos: false });
    }
  },
  
  addTodo: (todo) => {
    set((state) => ({ todos: [todo, ...state.todos] }));
    get().refreshStats();
  },
  
  updateTodo: (updatedTodo) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
    }));
    get().refreshStats();
  },
  
  removeTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }));
    get().refreshStats();
  },
  
  completeTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }));
    get().refreshStats();
  },
  
  refreshStats: async () => {
    try {
      const stats = await todoApi.getStats();
      set({ todoStats: stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },
  
  // Inspirations
  inspirations: [],
  isLoadingInspirations: false,
  
  loadInspirations: async () => {
    set({ isLoadingInspirations: true });
    try {
      const inspirations = await inspirationApi.getAll();
      set({ inspirations });
    } catch (error) {
      console.error('Failed to load inspirations:', error);
    } finally {
      set({ isLoadingInspirations: false });
    }
  },
  
  addInspiration: (inspiration) => {
    set((state) => ({ inspirations: [inspiration, ...state.inspirations] }));
  },
  
  removeInspiration: (id) => {
    set((state) => ({
      inspirations: state.inspirations.filter((i) => i.id !== id),
    }));
  },
  
  // UI State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
