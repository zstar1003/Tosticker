# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToSticker (吐司便签) is a cross-platform desktop sticky note and todo application built with Tauri v2 + React + TypeScript. It supports Windows, macOS, and Linux.

## Development Commands

```bash
# Install dependencies
bun install

# Generate app icons (required before first build)
bun run icon:generate

# Start development (runs both Vite dev server and Tauri)
bun run tauri:dev

# Build production version
bun run tauri:build

# Type check
bun run typecheck

# Lint
bun run lint
```

## Architecture

### Frontend (React + TypeScript)
- **src/App.tsx**: Main application component, contains the todo list UI, drag-and-drop sorting logic, and AI integration
- **src/hooks/useStore.ts**: Zustand store for global state management (todos, inspirations, UI state)
- **src/utils/ai.ts**: AI integration with Zhipu AI (智谱AI) for todo title optimization using `glm-4-flash` model
- **src/types/index.ts**: TypeScript type definitions for Todo, Inspiration, and API requests

### Backend (Rust + Tauri)
- **src-tauri/src/lib.rs**: Tauri app entry point, plugin initialization, global shortcut (Ctrl+O) registration, reminder background task
- **src-tauri/src/commands/**: Tauri commands exposed to frontend
  - `todo.rs`: CRUD operations for todos (create, get, update, complete, delete, reorder)
  - `inspiration.rs`: Quick note/inspiration management
  - `sync.rs`: Database path retrieval
- **src-tauri/src/db/mod.rs**: SQLite database initialization and migrations using sqlx
- **src-tauri/src/models/mod.rs**: Rust structs for database models

### Data Flow
1. Frontend calls Tauri commands via `invoke()` from `@tauri-apps/api/core`
2. Commands in `src-tauri/src/commands/` handle business logic
3. SQLite database (`tosticker.db`) stores all data in app data directory

### Key Features
- **Always-on-top window**: Configurable via pin button, defaults to pinned
- **Global shortcut**: Ctrl+O toggles window visibility (registered in lib.rs)
- **Drag-and-drop sorting**: Custom implementation in App.tsx using mouse events
- **AI-powered title optimization**: Uses Zhipu AI API, settings stored in localStorage
- **Priority system**: High (red), Medium (yellow), Low (blue) with color indicators

### Database Schema
- `todos`: id, title, description, priority, due_date, reminder_at, completed, archived, sort_order, created_at, updated_at
- `inspirations`: id, content, tags (JSON array), created_at

## Technology Stack
- **Runtime**: Bun
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend**: Tauri v2, Rust 2021 Edition
- **Database**: SQLite via sqlx
- **Icons**: Lucide React
