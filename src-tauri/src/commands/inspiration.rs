use crate::db::Db;
use crate::models::{CreateInspirationRequest, Inspiration};
use chrono::Utc;
use serde_json::json;
use tauri::{command, State};
use uuid::Uuid;

#[command]
pub async fn create_inspiration(
    db: State<'_, Db>,
    request: CreateInspirationRequest,
) -> Result<Inspiration, String> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let tags_json = json!(request.tags).to_string();

    let inspiration = sqlx::query_as::<_, Inspiration>(
        r#"
        INSERT INTO inspirations (id, content, tags, created_at)
        VALUES (?1, ?2, ?3, ?4)
        RETURNING *
        "#,
    )
    .bind(&id)
    .bind(&request.content)
    .bind(&tags_json)
    .bind(now)
    .fetch_one(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(inspiration)
}

#[command]
pub async fn get_inspirations(db: State<'_, Db>) -> Result<Vec<Inspiration>, String> {
    let inspirations = sqlx::query_as::<_, Inspiration>(
        r#"
        SELECT * FROM inspirations 
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(inspirations)
}

#[command]
pub async fn delete_inspiration(db: State<'_, Db>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM inspirations WHERE id = ?1")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn search_inspirations(
    db: State<'_, Db>,
    query: String,
) -> Result<Vec<Inspiration>, String> {
    let search_pattern = format!("%{}%", query);
    let inspirations = sqlx::query_as::<_, Inspiration>(
        r#"
        SELECT * FROM inspirations 
        WHERE content LIKE ?1 OR tags LIKE ?1
        ORDER BY created_at DESC
        "#,
    )
    .bind(&search_pattern)
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(inspirations)
}
