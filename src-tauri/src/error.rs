// 1. 引入 serde::Serialize
use serde::Serialize;

// 2. 在 derive 列表中添加 Serialize
#[derive(Debug, Serialize)]
pub enum ApiError {
    DatabaseError(String),
}

// 3. (推荐) 为 ApiError 实现 From<sea_orm::DbErr>
// 这能让我们在 command 中方便地使用 '?' 操作符
impl From<sea_orm::DbErr> for ApiError {
    fn from(err: sea_orm::DbErr) -> Self {
        ApiError::DatabaseError(err.to_string())
    }
}
