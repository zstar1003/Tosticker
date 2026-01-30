use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub type Db = Pool<Sqlite>;

pub async fn init_db(app: &AppHandle) -> Result<Db, sqlx::Error> {
    let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
    
    let db_path = app_dir.join("mindflow.db");
    let db_url = format!("sqlite:{}", db_path.to_str().unwrap());
    
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    
    migrate(&pool).await?;
    
    Ok(pool)
}

async fn migrate(pool: &Db) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT NOT NULL DEFAULT 'medium',
            due_date TIMESTAMP,
            reminder_at TIMESTAMP,
            completed BOOLEAN NOT NULL DEFAULT 0,
            archived BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS inspirations (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            tags TEXT NOT NULL DEFAULT '[]',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Create index for better query performance
    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
        CREATE INDEX IF NOT EXISTS idx_todos_archived ON todos(archived);
        CREATE INDEX IF NOT EXISTS idx_todos_reminder ON todos(reminder_at);
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}
