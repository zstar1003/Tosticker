import { useAppStore } from '@/hooks/useStore';
import { ViewMode } from '@/types';
import { CheckCircle2, Clock, Lightbulb, Menu, Archive, Layout } from 'lucide-react';

const menuItems: { view: ViewMode; label: string; icon: React.ReactNode }[] = [
  { view: 'todos', label: '待办事项', icon: <CheckCircle2 size={20} /> },
  { view: 'inspirations', label: '灵感碎片', icon: <Lightbulb size={20} /> },
  { view: 'archived', label: '归档', icon: <Archive size={20} /> },
];

export function Sidebar() {
  const { currentView, setCurrentView, isSidebarOpen, toggleSidebar, todoStats } = useAppStore();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static lg:translate-x-0 z-40 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">MindFlow</h1>
              <p className="text-xs text-gray-500">轻量待办</p>
            </div>
          </div>

          {/* Stats Card */}
          {todoStats && (
            <div className="mb-6 p-4 bg-gradient-to-br from-pastel-blue/30 to-pastel-purple/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">待办进度</span>
                <Clock size={14} className="text-gray-400" />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {todoStats.completed}
                </span>
                <span className="text-sm text-gray-500 mb-1">
                  / {todoStats.total} 完成
                </span>
              </div>
              <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      todoStats.total > 0
                        ? (todoStats.completed / todoStats.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentView === item.view
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={currentView === item.view ? 'text-primary-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Layout size={12} />
            <span>MindFlow v0.1.1</span>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
