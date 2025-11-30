use chrono::Utc;
use sea_orm::{
    ActiveModelTrait,
    ActiveValue::Set,
    // 【关键】必须引入 ColumnTrait 才能使用 UserWord::Column::Due
    ColumnTrait,
    DatabaseConnection,
    DbErr,
    // 【关键】必须引入 EntityTrait 才能使用 .find()
    EntityTrait,
    // 【关键】必须引入 QueryFilter 才能使用 .filter()
    QueryFilter,
    // 【关键】必须引入 QueryOrder 才能使用 .order_by_asc()
    QueryOrder,
};

use crate::{
    algorithm::{self, Rating},
    entities::{master_word, prelude::UserWord, user_word},
    models::Word,
};

pub async fn add_word_to_learning(
    db: &DatabaseConnection,
    master_id: i32,
) -> Result<user_word::Model, DbErr> {
    // 1. 构建要插入的数据 (ActiveModel)
    // 这里我们初始化 SRS (间隔重复) 的默认参数
    let new_learning_record = user_word::ActiveModel {
        master_word_id: Set(master_id), // 关联主词库 ID

        stability: Set(0.0),         // 初始稳定性 (0 表示完全没记住)
        difficulty: Set(0.0),        // 初始难度 (0 表示默认难度)
        due: Set(Utc::now().into()), // 到期时间：现在 (意味着添加后立即就可以开始复习)
        status: Set(0),              // 状态：0 代表 "New" (新单词)

        last_review: Set(None),           // 还没复习过，所以是 None
        added_at: Set(Utc::now().into()), // 记录添加时间

        ..Default::default() // ID 会自动生成
    };

    new_learning_record.insert(db).await
}

// 【新增】获取今日需要复习的单词 (包含主词库的详细信息)
// 返回值类型是: Vec<(UserWordModel, Option<MasterWordModel>)>
// SeaORM 的 find_also_related 会返回一个元组

pub async fn get_due_words(
    db: &DatabaseConnection,
) -> Result<Vec<(user_word::Model, Option<master_word::Model>)>, DbErr> {
    UserWord::find()
        .filter(user_word::Column::Due.lte(Utc::now()))
        .order_by_asc(user_word::Column::Due)
        .find_also_related(master_word::Entity)
        .all(db)
        .await
}

pub async fn submit_review(
    db: &DatabaseConnection,
    user_word_id: i32,
    rating_val: i32,
) -> Result<(), DbErr> {
    let word_model = UserWord::find_by_id(user_word_id)
        .one(db)
        .await?
        .ok_or(DbErr::RecordNotFound("Word not found".to_owned()))?;
    let rating = Rating::from_i32(rating_val).unwrap_or(Rating::Good);
    let result =
        algorithm::calculate_next_review(word_model.stability, word_model.difficulty, rating);

    let mut active_model: user_word::ActiveModel = word_model.into();

    active_model.stability = Set(result.new_stability);
    active_model.difficulty = Set(result.new_difficulty);
    active_model.due = Set(result.next_due.into());
    active_model.last_review = Set(Some(Utc::now().into()));

    active_model.status = Set(1);
    active_model.update(db).await?;

    Ok(())
}
