use chrono::Utc;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, DatabaseConnection, DbErr};

use crate::entities::user_word;

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
