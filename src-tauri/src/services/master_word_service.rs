use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, QueryOrder};

use crate::{
    db,
    entities::{master_word, prelude::MasterWord},
};

pub async fn get_all_master_words(
    db: &DatabaseConnection,
) -> Result<Vec<master_word::Model>, DbErr> {
    Ok(MasterWord::find().all(db).await?)
}


//首字母返回
pub async fn get_master_word_by_first_letter(
    db: &DatabaseConnection,
    letter: Option<String>,
) -> Result<Vec<master_word::Model>, DbErr> {
    let mut query = MasterWord::find();

    if let Some(l) = letter {
        let pattern = format!("{}%", l);
        query = query.filter(master_word::Column::Text.like((pattern)))
    }

    query
        // 【解决乱序问题】强制按单词拼写排序
        .order_by_asc(master_word::Column::Text) 
        // 【解决卡顿问题】如果是全部加载，这里可以限制数量，比如 .limit(50)
        // 但既然我们按字母分了，通常一个字母下的单词量不会特别大，直接返回即可
        .all(db)
        .await
}
