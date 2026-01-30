import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Plus, X, Check, Trash2, Pin, RotateCcw } from 'lucide-react';
import './App.css';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [isPinned, setIsPinned] = useState(true);
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
    // 根据当前分类加载对应数据
    loadTodos(activeTab === 'completed');
    
    // 获取当前窗口置顶状态
    appWindow.isAlwaysOnTop().then(setIsPinned);
    
    // 监听提醒事件
    const unlisten = listen('todo-reminder', (event) => {
      console.log('Reminder:', event.payload);
    });
    
    return () => {
      unlisten.then(fn => fn());
    };
  }, [loadTodos, activeTab, appWindow]);

  // 拖动处理 - 只在便签背景/头部区域启动拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // 检查是否点击了交互元素（按钮、输入框、复选框等）
    const isInteractive = 
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.tab-container');
    
    // 如果点击的是交互元素，不启动拖动，也不阻止默认行为
    if (isInteractive) {
      return;
    }
    
    // 只在便签容器或头部区域启动拖动
    const isDraggableArea = 
      target.classList.contains('sticker-container') ||
      target.classList.contains('sticker-header') ||
      target.classList.contains('app-title') ||
      target.classList.contains('pin-icon') ||
      target.classList.contains('header-right') ||
      target.classList.contains('header-left') ||
      target.classList.contains('shortcut-hint') ||
      target.closest('.sticker-header');
    
    if (isDraggableArea) {
      e.preventDefault();
      appWindow.startDragging();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    
    const isInteractive = 
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.tab-container');
    
    if (isInteractive) {
      return;
    }
    
    const isDraggableArea = 
      target.classList.contains('sticker-container') ||
      target.classList.contains('sticker-header') ||
      target.classList.contains('app-title') ||
      target.classList.contains('pin-icon') ||
      target.classList.contains('header-right') ||
      target.classList.contains('header-left') ||
      target.classList.contains('shortcut-hint') ||
      target.closest('.sticker-header');
    
    if (isDraggableArea) {
      appWindow.startDragging();
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      await invoke('create_todo', {
        request: {
          title: newTodo.trim(),
          priority,
        }
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

  const closeWindow = () => {
    appWindow.hide();
  };

  const togglePin = async () => {
    try {
      const newState = !isPinned;
      await appWindow.setAlwaysOnTop(newState);
      setIsPinned(newState);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTodo('');
    }
  };

  const priorityColors = {
    high: '#ff6b6b',
    medium: '#feca57', 
    low: '#48dbfb'
  };

  // 根据当前分类筛选待办（使用 archived 字段）
  const filteredTodos = todos.filter(todo => 
    activeTab === 'pending' ? !todo.archived : todo.archived
  );

  const pendingCount = todos.filter(t => !t.archived).length;
  const completedCount = todos.filter(t => t.archived).length;

  return (
    <div 
      className="sticker-container"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* 便签头部 */}
      <div className="sticker-header">
        <div className="header-left">
          <button 
            className={`pin-btn ${isPinned ? 'pinned' : ''}`}
            onClick={togglePin}
            title={isPinned ? '取消置顶' : '置顶窗口'}
          >
            <Pin size={14} className="pin-icon" />
          </button>
          <span className="app-title">吐司便签</span>
        </div>
        <div className="header-right">
          <span className="shortcut-hint">Ctrl+O</span>
          <button className="close-btn" onClick={closeWindow} title="隐藏 (Ctrl+O)">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          未完成
          {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          已完成
          {completedCount > 0 && <span className="tab-badge">{completedCount}</span>}
        </button>
      </div>

      {/* 待办列表 */}
      <div className="todo-list">
        {filteredTodos.length === 0 && !isAdding ? (
          <div className="empty-state">
            <p>{activeTab === 'pending' ? '暂无待办事项' : '暂无已完成事项'}</p>
            <p>{activeTab === 'pending' ? '点击 + 添加待办' : '完成任务后会显示在这里'}</p>
          </div>
        ) : (
          <>
            {filteredTodos.map((todo) => (
              <div 
                key={todo.id} 
                className={`todo-item ${todo.archived ? 'completed' : ''}`}
                style={{ borderLeftColor: priorityColors[todo.priority] }}
              >
                <button 
                  className="checkbox"
                  onClick={() => todo.archived ? restoreTodo(todo.id) : toggleTodo(todo.id)}
                >
                  {todo.archived && <Check size={12} />}
                </button>
                <div className="todo-content">
                  <span className="todo-text">{todo.title}</span>
                  {activeTab === 'completed' && todo.updated_at && (
                    <span className="todo-date">
                      完成日期：{new Date(todo.updated_at).getFullYear()}年{new Date(todo.updated_at).getMonth() + 1}月{new Date(todo.updated_at).getDate()}日
                    </span>
                  )}
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                  title="删除"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </>
        )}

        {/* 添加新待办 - 只在未完成分类显示 */}
        {isAdding && activeTab === 'pending' && (
          <div className="add-todo-form">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
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
        )}
      </div>

      {/* 底部添加按钮 - 只在未完成分类显示 */}
      {!isAdding && activeTab === 'pending' && (
        <button className="add-btn" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}

export default App;
