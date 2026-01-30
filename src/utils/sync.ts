import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { Todo, Inspiration } from '@/types';

interface BackupData {
  version: string;
  exportDate: string;
  todos: Todo[];
  inspirations: Inspiration[];
}

export const syncApi = {
  // Export all data to JSON file
  exportData: async (todos: Todo[], inspirations: Inspiration[]) => {
    const data: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      todos,
      inspirations,
    };

    const filePath = await save({
      filters: [
        {
          name: 'MindFlow Backup',
          extensions: ['json'],
        },
      ],
      defaultPath: `mindflow-backup-${new Date().toISOString().split('T')[0]}.json`,
    });

    if (filePath) {
      await writeTextFile(filePath, JSON.stringify(data, null, 2));
      return true;
    }
    return false;
  },

  // Import data from JSON file
  importData: async (): Promise<BackupData | null> => {
    const selected = await open({
      filters: [
        {
          name: 'MindFlow Backup',
          extensions: ['json'],
        },
      ],
      multiple: false,
    });

    if (selected && typeof selected === 'string') {
      const content = await readTextFile(selected);
      const data: BackupData = JSON.parse(content);
      return data;
    }
    return null;
  },

  // Get database file path for manual sync setup
  getDatabasePath: async (): Promise<string> => {
    return invoke('get_database_path');
  },
};
