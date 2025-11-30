use chrono::Utc;
use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, PaginatorTrait, QueryFilter};
use serde::Serialize;

use crate::entities::{
    prelude::{MasterWord, UserWord},
    user_word,
};

#[derive(Serialize)]
pub struct DashboardStats {
    pub total_master: u64,
    pub total_learning: u64,
    pub due_today: u64,
}

pub async fn get_stats(db: &DatabaseConnection) -> Result<DashboardStats, DbErr> {
    // 1. 查 master_word 总数
    let total_master = MasterWord::find().count(db).await?;
    // 2. 查 user_word 总数
    let total_learning = UserWord::find().count(db).await?;
    // 3. 查 user_word 中 due <= now 的数量
    let due_today = UserWord::find()
        .filter(user_word::Column::Due.lte(Utc::now()))
        .count(db)
        .await?;

    Ok(DashboardStats {
        total_master,
        total_learning,
        due_today,
    })
}
