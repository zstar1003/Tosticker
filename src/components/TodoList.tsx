import { useState } from 'react';
import { useAppStore } from '@/hooks/useStore';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
import { Plus, Search, Filter } from 'lucide-react';

export function TodoList() {
  const { todos, isLoadingTodos } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter ? todo.priority === priorityFilter : true;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">待办事项</h2>
            <p className="text-sm text-gray-500 mt-1">
              共 {todos.length} 个待办
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            <span>新建待办</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索待办事项..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            {['high', 'medium', 'low'].map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priorityFilter === priority ? null : priority)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  priorityFilter === priority
                    ? `priority-${priority} border`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoadingTodos ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || priorityFilter ? '没有匹配的待办' : '暂无待办事项'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {searchQuery || priorityFilter
                ? '尝试调整搜索条件或过滤器'
                : '点击右上角"新建待办"按钮开始记录你的第一个任务'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {filteredTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </div>

      {/* Create Todo Modal */}
      {isFormOpen && <TodoForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
