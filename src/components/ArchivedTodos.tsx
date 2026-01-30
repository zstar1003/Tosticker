import { useAppStore } from '@/hooks/useStore';
import { CheckCircle2, Clock, RotateCcw, Trash2, Archive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { todoApi } from '@/utils/api';

export function ArchivedTodos() {
  const { archivedTodos, loadArchivedTodos, refreshStats, isLoadingTodos } = useAppStore();

  const handleRestore = async (id: string) => {
    try {
      await todoApi.update({ id, completed: false });
      await loadArchivedTodos();
      await refreshStats();
    } catch (error) {
      console.error('Failed to restore todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要永久删除这个待办事项吗？')) {
      try {
        await todoApi.delete(id);
        await loadArchivedTodos();
        await refreshStats();
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('确定要清空所有归档的待办事项吗？此操作不可恢复。')) {
      try {
        for (const todo of archivedTodos) {
          await todoApi.delete(todo.id);
        }
        await loadArchivedTodos();
        await refreshStats();
      } catch (error) {
        console.error('Failed to clear archived todos:', error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">归档</h2>
            <p className="text-sm text-gray-500 mt-1">
              已完成的待办事项会自动归档到这里
            </p>
          </div>
          {archivedTodos.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              <span>清空归档</span>
            </button>
          )}
        </div>
      </div>

      {/* Archived List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoadingTodos ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : archivedTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Archive size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无归档</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              已完成的待办事项会自动归档到这里
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {archivedTodos.map((todo) => (
              <div
                key={todo.id}
                className="group bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-600 line-through">
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>创建于 {format(parseISO(todo.created_at), 'MM/dd', { locale: zhCN })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>完成于 {format(parseISO(todo.updated_at), 'MM/dd', { locale: zhCN })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRestore(todo.id)}
                      className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                      title="恢复"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
