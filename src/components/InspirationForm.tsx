import { useState } from 'react';
import { CreateInspirationRequest } from '@/types';
import { useAppStore } from '@/hooks/useStore';
import { inspirationApi } from '@/utils/api';
import { X, Tag, Sparkles } from 'lucide-react';

interface InspirationFormProps {
  onClose: () => void;
}

export function InspirationForm({ onClose }: InspirationFormProps) {
  const { addInspiration } = useAppStore();
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const request: CreateInspirationRequest = {
        content: content.trim(),
        tags,
      };

      const inspiration = await inspirationApi.create(request);
      addInspiration(inspiration);
      onClose();
    } catch (error) {
      console.error('Failed to create inspiration:', error);
      alert('记录灵感失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full animate-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pastel-yellow to-pastel-pink rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">记录灵感</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                灵感内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="记录下你的创意想法、灵感碎片..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                autoFocus
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Tag size={14} />
                标签
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="输入标签后按回车添加..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-pastel-blue/30 text-blue-700 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
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
                disabled={!content.trim() || isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-pastel-pink to-pastel-purple text-gray-800 font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {isSubmitting ? '保存中...' : '记录灵感'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
