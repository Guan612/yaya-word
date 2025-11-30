use sea_orm::DatabaseConnection;
use tauri::State;

use crate::{
    db,
    entities::{master_word, user_word},
    error::ApiError,
    models::ReviewCard,
    services::{
        master_word_service,
        stats_service::{self, DashboardStats},
        user_word_service,
    },
};

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

#[tauri::command]
pub async fn get_due_words(db: State<'_, DatabaseConnection>) -> Result<Vec<ReviewCard>, ApiError> {
    let raw_resluts = user_word_service::get_due_words(&db).await?;
    let review_cards: Vec<ReviewCard> = raw_resluts
        .into_iter()
        .filter_map(|(user, master)| ReviewCard::from_query_result(user, master))
        .collect();
    Ok(review_cards)
}

#[tauri::command]
pub async fn submit_review(
    db: State<'_, DatabaseConnection>,
    rating_val: i32,
    user_word_id: i32,
) -> Result<(), ApiError> {
    let raw_resluts = user_word_service::submit_review(&db, user_word_id, rating_val).await?;
    Ok(raw_resluts)
}

#[tauri::command]
pub async fn get_dashboard_stats(
    db: State<'_, DatabaseConnection>,
) -> Result<DashboardStats, ApiError> {
    let raw_resluts = stats_service::get_stats(&db).await?;
    Ok(raw_resluts)
}
