// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod db;
pub mod models;

use commands::*;
use db::{init_db, Db};
use std::time::Duration;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tokio::time::interval;

async fn check_reminders_task(app_handle: tauri::AppHandle) -> Result<(), String> {
    let db = app_handle.state::<Db>();
    let todos = get_todos_with_reminders(db).await?;
    
    for todo in todos {
        let _ = app_handle.emit("todo-reminder", todo);
    }
    
    Ok(())
}

fn toggle_window_visibility(app_handle: &tauri::AppHandle) {
    if let Some(window) = app_handle.get_webview_window("main") {
        if let Ok(is_visible) = window.is_visible() {
            if is_visible {
                let _ = window.hide();
            } else {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new()
            .with_handler(|app, shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    // Ctrl+O on all platforms
                    if shortcut.matches(Modifiers::CONTROL, Code::KeyO) {
                        toggle_window_visibility(&app.app_handle());
                    }
                }
            })
            .build())
        .setup(|app| {
            // Register global shortcut Ctrl+O
            let ctrl_o = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyO);
            app.global_shortcut()
                .register(ctrl_o)
                .expect("Failed to register global shortcut");
            
            tauri::async_runtime::block_on(async move {
                let db = init_db(&app.app_handle()).await.expect("Failed to init db");
                app.manage(db);
                
                // Start reminder checker
                let app_handle = app.app_handle().clone();
                tauri::async_runtime::spawn(async move {
                    let mut interval = interval(Duration::from_secs(60));
                    loop {
                        interval.tick().await;
                        let _ = check_reminders_task(app_handle.clone()).await;
                    }
                });
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_todo,
            get_todos,
            update_todo,
            complete_todo,
            delete_todo,
            get_todo_stats,
            get_todos_with_reminders,
            update_todo_order,
            create_inspiration,
            get_inspirations,
            delete_inspiration,
            search_inspirations,
            get_database_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
