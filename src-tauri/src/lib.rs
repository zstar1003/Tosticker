// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod commands;
pub mod db;
pub mod models;

use commands::*;
use db::init_db;
use std::time::Duration;
use tauri::Manager;
use tokio::time::interval;

#[tauri::command]
pub async fn check_reminders(app: tauri::AppHandle) -> Result<(), String> {
    let db = app.state::<db::Db>();
    let todos = get_todos_with_reminders(db.inner().clone()).await?;
    
    for todo in todos {
        let _ = app.emit("todo-reminder", todo);
    }
    
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                let db = init_db(&app.handle()).await.expect("Failed to init db");
                app.manage(db);
                
                // Start reminder checker
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    let mut interval = interval(Duration::from_secs(60));
                    loop {
                        interval.tick().await;
                        let _ = check_reminders(app_handle.clone()).await;
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
            create_inspiration,
            get_inspirations,
            delete_inspiration,
            search_inspirations,
            get_database_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
