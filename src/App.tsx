import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Plus, X, Check, Trash2, Pin } from 'lucide-react';
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
  const appWindow = getCurrentWebviewWindow();

  // 加载待办
  const loadTodos = useCallback(async () => {
    try {
      const result = await invoke<Todo[]>('get_todos', { archived: false });
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
    
    // 监听提醒事件
    const unlisten = listen('todo-reminder', (event) => {
      console.log('Reminder:', event.payload);
    });
    
    return () => {
      unlisten.then(fn => fn());
    };
  }, [loadTodos]);

  // 拖动处理 - 鼠标按下时立即开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    // 如果点击的是按钮、输入框等交互元素，不启动拖动
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }
    
    // 立即启动拖动
    e.preventDefault();
    appWindow.startDragging();
  };

  // 触摸拖动支持
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }
    
    appWindow.startDragging();
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
      loadTodos();
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      await invoke('complete_todo', { id });
      loadTodos();
    } catch (error) {
      console.error('Failed to complete todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await invoke('delete_todo', { id });
      loadTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const closeWindow = () => {
    appWindow.hide();
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

  return (
    <div 
      className="sticker-container"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* 便签头部 - 这个区域总是可拖动 */}
      <div className="sticker-header">
        <div className="header-left">
          <Pin size={14} className="pin-icon" />
          <span className="app-title">吐司便签</span>
        </div>
        <div className="header-right">
          <span className="shortcut-hint">Ctrl+O</span>
          <button className="close-btn" onClick={closeWindow} title="隐藏 (Ctrl+O)">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 待办列表 */}
      <div className="todo-list">
        {todos.length === 0 && !isAdding ? (
          <div className="empty-state">
            <p>按 Ctrl+O 快速打开</p>
            <p>点击 + 添加待办</p>
          </div>
        ) : (
          <>
            {todos.map((todo) => (
              <div 
                key={todo.id} 
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
                style={{ borderLeftColor: priorityColors[todo.priority] }}
              >
                <button 
                  className="checkbox"
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed && <Check size={12} />}
                </button>
                <span className="todo-text">{todo.title}</span>
                <button 
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </>
        )}

        {/* 添加新待办 */}
        {isAdding && (
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

      {/* 底部添加按钮 */}
      {!isAdding && (
        <button className="add-btn" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}

export default App;
