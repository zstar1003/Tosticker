use tauri::{command, AppHandle, Manager};
use std::path::PathBuf;

#[command]
pub fn get_database_path(app: AppHandle) -> Result<String, String> {
    let app_dir = app.path().app_data_dir()
        .map_err(|e| e.to_string())?;
    let db_path = app_dir.join("mindflow.db");
    Ok(db_path.to_string_lossy().to_string())
}
