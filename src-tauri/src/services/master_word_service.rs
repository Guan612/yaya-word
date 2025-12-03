use sea_orm::{
    ColumnTrait, Condition, DatabaseConnection, DbErr, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect,
};

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
        query = query.filter(master_word::Column::Text.like(pattern))
    }

    query
        // 【解决乱序问题】强制按单词拼写排序
        .order_by_asc(master_word::Column::Text)
        // 【解决卡顿问题】如果是全部加载，这里可以限制数量，比如 .limit(50)
        // 但既然我们按字母分了，通常一个字母下的单词量不会特别大，直接返回即可
        .all(db)
        .await
}

//分页查询
pub async fn get_words_paginated(
    db: &DatabaseConnection,
    page: u64,
    page_size: u64,
) -> Result<Vec<master_word::Model>, DbErr> {
    MasterWord::find()
        .order_by_asc(master_word::Column::Text)
        .limit(page_size)
        .offset(page * page_size)
        .all(db)
        .await
}

//搜索单词
pub async fn search_words(
    db: &DatabaseConnection,
    keyword: String,
) -> Result<Vec<master_word::Model>, DbErr> {
    MasterWord::find()
        .filter(
            Condition::any()
                .add(master_word::Column::Text.like(format!("{}%", keyword)))
                .add(master_word::Column::Definition.like(format!("{}%", keyword))),
        )
        .limit(50)
        .all(db)
        .await
}
