import { useState } from 'react';
import { Todo, UpdateTodoRequest } from '@/types';
import { useAppStore } from '@/hooks/useStore';
import { todoApi } from '@/utils/api';
import { Check, Clock, Trash2, AlertCircle, Calendar, Bell, Edit2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { updateTodo, removeTodo, completeTodo } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const priorityConfig = {
    high: { color: 'bg-red-100 text-red-700 border-red-200', label: '高优先级', icon: AlertCircle },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '中优先级', icon: Clock },
    low: { color: 'bg-green-100 text-green-700 border-green-200', label: '低优先级', icon: Check },
  };

  const priority = priorityConfig[todo.priority];

  const handleComplete = async () => {
    try {
      await todoApi.complete(todo.id);
      completeTodo(todo.id);
    } catch (error) {
      console.error('Failed to complete todo:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('确定要删除这个待办事项吗？')) {
      try {
        await todoApi.delete(todo.id);
        removeTodo(todo.id);
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const request: UpdateTodoRequest = {
        id: todo.id,
        title: editTitle,
        description: editDescription || undefined,
      };
      const updated = await todoApi.update(request);
      updateTodo(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 animate-slide-up">
      <div className="flex items-start gap-4">
        {/* Complete Button */}
        <button
          onClick={handleComplete}
          className="mt-1 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center"
        >
          <Check size={12} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="添加描述..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(todo.title);
                    setEditDescription(todo.description || '');
                  }}
                  className="px-3 py-1.5 text-gray-600 text-sm hover:text-gray-900"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">{todo.title}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
              
              {todo.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{todo.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {todo.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{format(parseISO(todo.due_date), 'MM/dd', { locale: zhCN })}</span>
                  </div>
                )}
                {todo.reminder_at && (
                  <div className="flex items-center gap-1 text-primary-500">
                    <Bell size={12} />
                    <span>{format(parseISO(todo.reminder_at), 'MM/dd HH:mm', { locale: zhCN })}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{format(parseISO(todo.created_at), 'MM/dd', { locale: zhCN })}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
