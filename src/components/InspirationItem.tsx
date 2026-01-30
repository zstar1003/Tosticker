import { Inspiration } from '@/types';
import { useAppStore } from '@/hooks/useStore';
import { inspirationApi } from '@/utils/api';
import { Trash2, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface InspirationItemProps {
  inspiration: Inspiration;
}

export function InspirationItem({ inspiration }: InspirationItemProps) {
  const { removeInspiration } = useAppStore();

  const handleDelete = async () => {
    if (confirm('确定要删除这条灵感吗？')) {
      try {
        await inspirationApi.delete(inspiration.id);
        removeInspiration(inspiration.id);
      } catch (error) {
        console.error('Failed to delete inspiration:', error);
      }
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {inspiration.content}
          </p>
          
          {inspiration.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {inspiration.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-pastel-blue/50 text-blue-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mt-4 text-xs text-gray-400">
            <Clock size={12} />
            <span>{format(parseISO(inspiration.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}</span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
