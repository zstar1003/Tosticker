import { useState } from 'react';
import { CreateTodoRequest } from '@/types';
import { useAppStore } from '@/hooks/useStore';
import { todoApi } from '@/utils/api';
import { X, Calendar, Bell } from 'lucide-react';
import { format, addDays, set } from 'date-fns';

interface TodoFormProps {
  onClose: () => void;
}

export function TodoForm({ onClose }: TodoFormProps) {
  const { addTodo } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reminderTime, setReminderTime] = useState(format(new Date(), 'HH:mm'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const request: CreateTodoRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: hasDueDate ? new Date(dueDate).toISOString() : undefined,
        reminder_at: hasReminder
          ? set(new Date(reminderDate), {
              hours: parseInt(reminderTime.split(':')[0]),
              minutes: parseInt(reminderTime.split(':')[1]),
            }).toISOString()
          : undefined,
      };

      const todo = await todoApi.create(request);
      addTodo(todo);
      onClose();
    } catch (error) {
      console.error('Failed to create todo:', error);
      alert('创建待办失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">新建待办</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入待办事项标题..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="添加详细描述（可选）..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                优先级
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'high', label: '高', color: 'bg-red-50 text-red-600 border-red-200' },
                  { value: 'medium', label: '中', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
                  { value: 'low', label: '低', color: 'bg-green-50 text-green-600 border-green-200' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as 'high' | 'medium' | 'low')}
                    className={`flex-1 py-2 px-4 rounded-xl border-2 font-medium transition-all ${
                      priority === p.value
                        ? p.color
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <input
                  type="checkbox"
                  id="hasDueDate"
                  checked={hasDueDate}
                  onChange={(e) => setHasDueDate(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="hasDueDate" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar size={14} />
                  设置截止日期
                </label>
              </div>
              {hasDueDate && (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              )}
            </div>

            {/* Reminder */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <input
                  type="checkbox"
                  id="hasReminder"
                  checked={hasReminder}
                  onChange={(e) => setHasReminder(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="hasReminder" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Bell size={14} />
                  设置提醒
                </label>
              </div>
              {hasReminder && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="px-5 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {isSubmitting ? '创建中...' : '创建待办'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
