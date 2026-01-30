import { useState } from 'react';
import { useAppStore } from '@/hooks/useStore';
import { InspirationForm } from './InspirationForm';
import { InspirationItem } from './InspirationItem';
import { Plus, Search, Sparkles } from 'lucide-react';

export function InspirationList() {
  const { inspirations, isLoadingInspirations } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInspirations = inspirations.filter((inspiration) =>
    inspiration.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inspiration.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">灵感碎片</h2>
            <p className="text-sm text-gray-500 mt-1">
              记录你的每一个创意火花
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pastel-pink to-pastel-purple text-gray-800 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            <span>记录灵感</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索灵感内容或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Inspiration List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoadingInspirations ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredInspirations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pastel-yellow to-pastel-pink rounded-full flex items-center justify-center mb-4">
              <Sparkles size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? '没有匹配的灵感' : '暂无灵感记录'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {searchQuery
                ? '尝试调整搜索关键词'
                : '点击右上角"记录灵感"按钮，随时捕捉你的创意想法'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
            {filteredInspirations.map((inspiration) => (
              <InspirationItem key={inspiration.id} inspiration={inspiration} />
            ))}
          </div>
        )}
      </div>

      {/* Create Inspiration Modal */}
      {isFormOpen && <InspirationForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
