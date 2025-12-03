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

//一次性请求所有
#[tauri::command]
pub async fn get_all_master_words(
    db: State<'_, DatabaseConnection>,
) -> Result<Vec<master_word::Model>, ApiError> {
    let words = master_word_service::get_all_master_words(&db).await?;

    Ok(words)
}

//按首字母查找
#[tauri::command]
pub async fn get_master_word_by_first_letter(
    db: State<'_, DatabaseConnection>,
    letter: Option<String>,
) -> Result<Vec<master_word::Model>, ApiError> {
    let words = master_word_service::get_master_word_by_first_letter(&db, letter).await?;
    Ok(words)
}

//分页查找
#[tauri::command]
pub async fn get_words_list_filiter(
    db: State<'_, DatabaseConnection>,
    page: u64,
    limit: u64,
) -> Result<Vec<master_word::Model>, ApiError> {
    let words = master_word_service::get_words_paginated(&db, page, limit).await?;
    Ok(words)
}

//搜索api
#[tauri::command]
pub async fn search_master_words(
    db: State<'_, DatabaseConnection>,
    keyword: String,
) -> Result<Vec<master_word::Model>, ApiError> {
    let words = master_word_service::search_words(&db, keyword).await?;
    Ok(words)
}

//添加单词到学习库
#[tauri::command]
pub async fn add_word_to_learning(
    db: State<'_, DatabaseConnection>,
    master_id: i32,
) -> Result<i32, ApiError> {
    let new_record = user_word_service::add_word_to_learning(&db, master_id).await?;
    Ok(new_record.id)
}

//自动添加单词
#[tauri::command]
pub async fn generate_new_words(
    db: State<'_, DatabaseConnection>,
    limit: u64,
) -> Result<u64, ApiError> {
    let count = user_word_service::generate_daily_new_words(&db, limit).await?;
    Ok(count)
}

//获取要复习的单词
#[tauri::command]
pub async fn get_due_words(db: State<'_, DatabaseConnection>) -> Result<Vec<ReviewCard>, ApiError> {
    let raw_resluts = user_word_service::get_due_words(&db).await?;
    let review_cards: Vec<ReviewCard> = raw_resluts
        .into_iter()
        .filter_map(|(user, master)| ReviewCard::from_query_result(user, master))
        .collect();
    Ok(review_cards)
}

//提交给tauri计算复习时间
#[tauri::command]
pub async fn submit_review(
    db: State<'_, DatabaseConnection>,
    rating_val: i32,
    user_word_id: i32,
) -> Result<(), ApiError> {
    let raw_resluts = user_word_service::submit_review(&db, user_word_id, rating_val).await?;
    Ok(raw_resluts)
}

//获取单词状态
#[tauri::command]
pub async fn get_dashboard_stats(
    db: State<'_, DatabaseConnection>,
) -> Result<DashboardStats, ApiError> {
    let raw_resluts = stats_service::get_stats(&db).await?;
    Ok(raw_resluts)
}
