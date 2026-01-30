import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
// import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

import { Plus, X, Check, Trash2, Pin, Settings } from 'lucide-react';
import './App.css';

function useMouseSort<T>(items: T[], getId: (item: T) => string, onReorder: (items: T[]) => void) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedItemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const item = target.closest('[data-sortable="true"]') as HTMLElement;
      if (!item || target.closest('button')) return;

      e.preventDefault();
      const id = item.getAttribute('data-todo-id');
      if (!id) return;

      setDraggedId(id);
      draggedItemRef.current = item;
      item.classList.add('dragging');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedItemRef.current) return;

      const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
      const targetItem = elementsBelow.find(
        el => el !== draggedItemRef.current && el.closest('[data-sortable="true"]')
      ) as HTMLElement | undefined;

      if (targetItem) {
        const targetId = targetItem.getAttribute('data-todo-id');
        if (targetId && targetId !== draggedId) {
          setDropTargetId(targetId);
          document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
          targetItem.classList.add('drag-over');
        }
      }
    };

    const handleMouseUp = () => {
      if (!draggedItemRef.current) return;

      const draggedId_current = draggedId;
      const targetId = dropTargetId;

      if (draggedId_current && targetId && draggedId_current !== targetId) {
        const newItems = [...items];
        const draggedIdx = newItems.findIndex(item => getId(item) === draggedId_current);
        const targetIdx = newItems.findIndex(item => getId(item) === targetId);

        if (draggedIdx !== -1 && targetIdx !== -1 && draggedIdx !== targetIdx) {
          const [removed] = newItems.splice(draggedIdx, 1);
          newItems.splice(targetIdx, 0, removed);
          onReorder(newItems);
        }
      }

      draggedItemRef.current.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      setDraggedId(null);
      setDropTargetId(null);
      draggedItemRef.current = null;
    };

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [items, draggedId, dropTargetId, getId, onReorder]);

  return { containerRef, draggedId, dropTargetId };
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  archived: boolean;
  priority: 'high' | 'medium' | 'low';
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [isPinned, setIsPinned] = useState(true);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const appWindow = getCurrentWebviewWindow();

  // 加载待办
  const loadTodos = useCallback(async (archived = false) => {
    try {
      const result = await invoke<Todo[]>('get_todos', { archived });
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos(activeTab === 'completed');
    appWindow.isAlwaysOnTop().then(setIsPinned);


  }, [loadTodos, activeTab, appWindow]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // 点击头部非按钮区域时启动窗口拖拽
    if (target.closest('.sticker-header') && !target.closest('button')) {
      e.preventDefault();
      appWindow.startDragging();
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await invoke('create_todo', {
        request: { title: newTodo.trim(), priority }
      });
      setNewTodo('');
      setIsAdding(false);
      loadTodos(activeTab === 'completed');
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      await invoke('complete_todo', { id });
      loadTodos(activeTab === 'completed');
    } catch (error) {
      console.error('Failed to complete todo:', error);
    }
  };

  const restoreTodo = async (id: string) => {
    try {
      await invoke('update_todo', { 
        request: { id, completed: false, archived: false }
      });
      loadTodos(activeTab === 'completed');
    } catch (error) {
      console.error('Failed to restore todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await invoke('delete_todo', { id });
      loadTodos(activeTab === 'completed');
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const updateTodoPriority = async (id: string, newPriority: 'high' | 'medium' | 'low') => {
    try {
      await invoke('update_todo', { request: { id, priority: newPriority } });
      setEditingTodoId(null);
      loadTodos(activeTab === 'completed');
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const closeWindow = () => appWindow.hide();
  
  const togglePin = async () => {
    const newState = !isPinned;
    await appWindow.setAlwaysOnTop(newState);
    setIsPinned(newState);
  };

  const priorityColors = {
    high: '#ff6b6b',
    medium: '#feca57', 
    low: '#48dbfb'
  };

  const filteredTodos = todos.filter(todo => 
    activeTab === 'pending' ? !todo.archived : todo.archived
  );

  const saveOrder = async (newTodos: Todo[], draggedItem: Todo) => {
    const samePriority = newTodos.filter(t => t.priority === draggedItem.priority && !t.archived);
    const orders: [string, number][] = samePriority.map((t, i) => [t.id, i * 10]);
    try {
      await invoke('update_todo_order', { orders });
    } catch (error) {
      console.error('Failed to save order:', error);
      loadTodos(false);
    }
  };
  const { containerRef: sortContainerRef, draggedId, dropTargetId } = useMouseSort(
    filteredTodos,
    (todo) => todo.id,
    (newItems) => {
      setTodos(prev => {
        const archivedItems = prev.filter(t => t.archived);
        const allTodos = activeTab === 'pending' 
          ? [...newItems, ...archivedItems]
          : [...archivedItems, ...newItems];
        
        const draggedItem = newItems.find(t => t.id === draggedId);
        if (draggedItem) {
          saveOrder(newItems, draggedItem);
        }
        
        return allTodos;
      });
    }
  );

  const pendingCount = todos.filter(t => !t.archived).length;
  const completedCount = todos.filter(t => t.archived).length;

  return (
    <div className="sticker-container">
      {/* 头部 */}
      <div className="sticker-header" onMouseDown={handleMouseDown}>
        <div className="header-left">
          <button className={`pin-btn ${isPinned ? 'pinned' : ''}`} onClick={togglePin}>
            <Pin size={14} />
          </button>
          <span className="app-title">吐司便签</span>
        </div>
        <div className="header-right">
          <span className="shortcut-hint">Ctrl+O</span>
          <button className="close-btn" onClick={closeWindow}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 标签 */}
      <div className="tab-container">
        <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          未完成 {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
        <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          已完成 {completedCount > 0 && <span className="tab-badge">{completedCount}</span>}
        </button>
      </div>

      {/* 列表 */}
      <div className="todo-list" ref={sortContainerRef}>
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            data-todo-id={todo.id}
            data-sortable={activeTab === 'pending' && !todo.archived}
            className={`todo-item ${todo.archived ? 'completed' : ''} ${draggedId === todo.id ? 'dragging' : ''} ${dropTargetId === todo.id ? 'drag-over' : ''}`}
            style={{ borderLeftColor: priorityColors[todo.priority] }}
          >
            <button className="checkbox" onClick={() => todo.archived ? restoreTodo(todo.id) : toggleTodo(todo.id)}>
              {todo.archived && <Check size={12} />}
            </button>

            <div className="todo-content">
              {editingTodoId === todo.id ? (
                <div className="priority-editor">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      className={`priority-btn-inline ${todo.priority === p ? 'active' : ''}`}
                      style={{ backgroundColor: priorityColors[p] }}
                      onClick={() => updateTodoPriority(todo.id, p)}
                    >
                      {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                    </button>
                  ))}
                  <button className="cancel-edit-btn" onClick={() => setEditingTodoId(null)}>取消</button>
                </div>
              ) : (
                <>
                  <span className="todo-text">{todo.title}</span>
                  {activeTab === 'completed' && todo.updated_at && (
                    <span className="todo-date">
                      完成：{new Date(todo.updated_at).getFullYear()}年{new Date(todo.updated_at).getMonth() + 1}月{new Date(todo.updated_at).getDate()}日
                    </span>
                  )}
                </>
              )}
            </div>
            
            <div className="todo-actions">
              {!todo.archived && editingTodoId !== todo.id && (
                <button className="settings-btn" onClick={() => setEditingTodoId(todo.id)}>
                  <Settings size={12} />
                </button>
              )}
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {isAdding && activeTab === 'pending' && (
          <div className="modal-overlay" onClick={() => {setIsAdding(false); setNewTodo('');}}>
            <div className="add-todo-form" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#5d4e37' }}>添加新待办</h3>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="输入待办事项..."
                autoFocus
                className="todo-input"
              />
              <div className="priority-selector">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    className={`priority-btn ${priority === p ? 'active' : ''}`}
                    style={{ backgroundColor: priorityColors[p] }}
                    onClick={() => setPriority(p)}
                  >
                    {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={addTodo}>添加</button>
                <button className="btn-secondary" onClick={() => {setIsAdding(false); setNewTodo('');}}>取消</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isAdding && activeTab === 'pending' && (
        <button className="add-btn" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}

export default App;
