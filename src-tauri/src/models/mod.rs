use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub priority: String, // high, medium, low
    pub due_date: Option<DateTime<Utc>>,
    pub reminder_at: Option<DateTime<Utc>>,
    pub completed: bool,
    pub archived: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Inspiration {
    pub id: String,
    pub content: String,
    pub tags: String, // JSON array as string
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateTodoRequest {
    pub title: String,
    pub description: Option<String>,
    pub priority: String,
    pub due_date: Option<DateTime<Utc>>,
    pub reminder_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UpdateTodoRequest {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<DateTime<Utc>>,
    pub reminder_at: Option<DateTime<Utc>>,
    pub completed: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateInspirationRequest {
    pub content: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TodoStats {
    pub total: i64,
    pub completed: i64,
    pub pending: i64,
    pub archived: i64,
}
