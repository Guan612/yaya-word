use sea_orm::DatabaseConnection;
use tauri::State;

use crate::{entities::master_word, error::ApiError, services::master_word_service};

#[tauri::command]
pub async fn get_all_master_words(
    db: State<'_, DatabaseConnection>,
) -> Result<Vec<master_word::Model>, ApiError> {
    let words = master_word_service::get_all_master_words(&db).await?;

    Ok(words)
}
