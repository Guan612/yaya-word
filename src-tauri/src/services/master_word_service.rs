use sea_orm::{DatabaseConnection, DbErr, EntityTrait};

use crate::entities::{master_word, prelude::MasterWord};

pub async fn get_all_master_words(
    db: &DatabaseConnection,
) -> Result<Vec<master_word::Model>, DbErr> {
    Ok(MasterWord::find().all(db).await?)
}
