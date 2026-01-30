use crate::db::Db;
use crate::models::*;
use chrono::Utc;
use serde_json::json;
use sqlx::Row;
use tauri::{command, State};
use uuid::Uuid;

#[command]
pub async fn create_todo(
    db: State<'_, Db>,
    request: CreateTodoRequest,
) -> Result<Todo, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();

    let todo = sqlx::query_as::<_, Todo>(
        r#"
        INSERT INTO todos (id, title, description, priority, due_date, reminder_at, completed, archived, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, 0, ?7, ?7)
        RETURNING *
        "#,
    )
    .bind(&id)
    .bind(&request.title)
    .bind(&request.description)
    .bind(&request.priority)
    .bind(request.due_date)
    .bind(request.reminder_at)
    .bind(now)
    .fetch_one(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(todo)
}

#[command]
pub async fn get_todos(db: State<'_, Db>, archived: bool) -> Result<Vec<Todo>, String> {
    let todos = sqlx::query_as::<_, Todo>(
        r#"
        SELECT * FROM todos 
        WHERE archived = ?1
        ORDER BY 
            CASE priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
                ELSE 4 
            END,
            due_date ASC NULLS LAST,
            created_at DESC
        "#,
    )
    .bind(archived)
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(todos)
}

#[command]
pub async fn update_todo(db: State<'_, Db>, request: UpdateTodoRequest) -> Result<Todo, String> {
    let now = Utc::now();

    // Use simple fixed query that handles all optional fields with COALESCE
    let todo = sqlx::query_as::<_, Todo>(
        r#"
        UPDATE todos 
        SET 
            updated_at = ?,
            completed = COALESCE(?, completed),
            archived = COALESCE(?, archived),
            priority = COALESCE(?, priority),
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            due_date = COALESCE(?, due_date),
            reminder_at = COALESCE(?, reminder_at)
        WHERE id = ?
        RETURNING *
        "#,
    )
    .bind(now)
    .bind(request.completed)
    .bind(request.archived)
    .bind(request.priority.as_ref())
    .bind(request.title.as_ref())
    .bind(request.description.as_ref())
    .bind(request.due_date)
    .bind(request.reminder_at)
    .bind(&request.id)
    .fetch_one(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(todo)
}

#[command]
pub async fn complete_todo(db: State<'_, Db>, id: String) -> Result<Todo, String> {
    let now = Utc::now();

    let todo = sqlx::query_as::<_, Todo>(
        r#"
        UPDATE todos 
        SET completed = 1, archived = 1, updated_at = ?1
        WHERE id = ?2
        RETURNING *
        "#,
    )
    .bind(now)
    .bind(&id)
    .fetch_one(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(todo)
}

#[command]
pub async fn delete_todo(db: State<'_, Db>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM todos WHERE id = ?1")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn get_todo_stats(db: State<'_, Db>) -> Result<TodoStats, String> {
    let row = sqlx::query(
        r#"
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN completed = 0 AND archived = 0 THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN archived = 1 THEN 1 ELSE 0 END) as archived
        FROM todos
        "#,
    )
    .fetch_one(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(TodoStats {
        total: row.get("total"),
        completed: row.get("completed"),
        pending: row.get("pending"),
        archived: row.get("archived"),
    })
}

#[command]
pub async fn get_todos_with_reminders(db: State<'_, Db>) -> Result<Vec<Todo>, String> {
    let now = Utc::now();
    let todos = sqlx::query_as::<_, Todo>(
        r#"
        SELECT * FROM todos 
        WHERE reminder_at IS NOT NULL 
        AND reminder_at <= ?1 
        AND completed = 0 
        AND archived = 0
        "#,
    )
    .bind(now)
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(todos)
}
