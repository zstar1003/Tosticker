import { invoke } from '@tauri-apps/api/core';
import {
  CreateInspirationRequest,
  CreateTodoRequest,
  Inspiration,
  Todo,
  TodoStats,
  UpdateTodoRequest,
} from '@/types';

export const todoApi = {
  create: (request: CreateTodoRequest) =>
    invoke<Todo>('create_todo', { request }),
  
  getAll: (archived: boolean = false) =>
    invoke<Todo[]>('get_todos', { archived }),
  
  update: (request: UpdateTodoRequest) =>
    invoke<Todo>('update_todo', { request }),
  
  complete: (id: string) =>
    invoke<Todo>('complete_todo', { id }),
  
  delete: (id: string) =>
    invoke<void>('delete_todo', { id }),
  
  getStats: () =>
    invoke<TodoStats>('get_todo_stats'),
  
  getWithReminders: () =>
    invoke<Todo[]>('get_todos_with_reminders'),
};

export const inspirationApi = {
  create: (request: CreateInspirationRequest) =>
    invoke<Inspiration>('create_inspiration', { request }),
  
  getAll: () =>
    invoke<Inspiration[]>('get_inspirations'),
  
  delete: (id: string) =>
    invoke<void>('delete_inspiration', { id }),
  
  search: (query: string) =>
    invoke<Inspiration[]>('search_inspirations', { query }),
};
