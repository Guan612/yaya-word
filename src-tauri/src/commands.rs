use sea_orm::DatabaseConnection;
use tauri::State;

use crate::{entities::master_word, error::ApiError, services::{master_word_service, user_word_service}};

#[tauri::command]
pub async fn get_all_master_words(
    db: State<'_, DatabaseConnection>,
) -> Result<Vec<master_word::Model>, ApiError> {
    let words = master_word_service::get_all_master_words(&db).await?;

    Ok(words)
}

#[tauri::command]
pub async fn add_word_to_learning(
    db: State<'_, DatabaseConnection>,
    master_id: i32,
) -> Result<i32, ApiError> {
    let new_record = user_word_service::add_word_to_learning(&db, master_id).await?;
    Ok(new_record.id)
}
