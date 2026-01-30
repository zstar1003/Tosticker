import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TodoList } from './components/TodoList';
import { InspirationList } from './components/InspirationList';
import { ArchivedTodos } from './components/ArchivedTodos';
import { useAppStore } from './hooks/useStore';
import { listen } from '@tauri-apps/api/event';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

function App() {
  const { currentView, loadTodos, loadInspirations, refreshStats, loadArchivedTodos } = useAppStore();

  useEffect(() => {
    // Initial data load
    loadTodos();
    loadInspirations();
    refreshStats();
    loadArchivedTodos();

    // Setup notification listener
    const setupNotifications = async () => {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }

      // Listen for todo reminders from backend
      const unlisten = await listen('todo-reminder', (event) => {
        const todo = event.payload as { title: string; description?: string };
        if (permissionGranted) {
          sendNotification({
            title: '⏰ 待办提醒',
            body: todo.title,
          });
        }
      });

      return unlisten;
    };

    const unlistenPromise = setupNotifications();

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [loadTodos, loadInspirations, refreshStats, loadArchivedTodos]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {currentView === 'todos' && <TodoList />}
        {currentView === 'inspirations' && <InspirationList />}
        {currentView === 'archived' && <ArchivedTodos />}
      </main>
    </div>
  );
}

export default App;
