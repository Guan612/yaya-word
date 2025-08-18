use sea_orm_migration::{prelude::*, schema::*, sea_orm::ActiveEnum};

// 从主 crate 导入我们刚刚移动的 Source enum
// 注意：main_lib 是 sea-orm-cli 约定的名称，代表你的主 src/lib.rs 或 src/main.rs
use yaya_word_lib::entities::source_enum::Source;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // MasterWord 表
        manager
            .create_table(
                Table::create()
                    .table(MasterWord::Table)
                    .if_not_exists()
                    .col(pk_auto(MasterWord::Id))
                    // ↓↓↓ 用 ColumnDef 链式 API（新写法）
                    .col(ColumnDef::new(MasterWord::Text).string().not_null())
                    .col(ColumnDef::new(MasterWord::Definition).string().not_null())
                    .col(ColumnDef::new(MasterWord::Pronunciation).string())
                    .col(ColumnDef::new(MasterWord::AudioUrl).string())
                    // ActiveEnum 列（非空）——如果想可空，.null() 并把实体字段用 Option<Source>
                    .col(string_null(MasterWord::Source))
                    .col(
                        ColumnDef::new(MasterWord::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // UserWord 表
        manager
            .create_table(
                Table::create()
                    .table(UserWord::Table)
                    .if_not_exists()
                    .col(pk_auto(UserWord::Id))
                    .col(ColumnDef::new(UserWord::MasterWordId).integer().not_null())
                    .col(ColumnDef::new(UserWord::Stability).float().not_null())
                    .col(ColumnDef::new(UserWord::Difficulty).float().not_null())
                    .col(
                        ColumnDef::new(UserWord::Due)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(ColumnDef::new(UserWord::LastReview).timestamp_with_time_zone())
                    .col(
                        ColumnDef::new(UserWord::Status)
                            .small_integer()
                            .not_null()
                            .default(0),
                    )
                    .col(
                        ColumnDef::new(UserWord::AddedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-user_word-master_word_id")
                            .from(UserWord::Table, UserWord::MasterWordId) // ← 不是 .form
                            .to(MasterWord::Table, MasterWord::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(()) // ← 别忘了返回 Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(UserWord::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(MasterWord::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum MasterWord {
    Table,
    Id,
    Text,          // 单词原文
    Definition,    // 核心释义
    Source,        // 单词来源
    Pronunciation, // 音标
    AudioUrl,      // 发音音频文件的链接
    CreatedAt,     // 单词入库时间
}

#[derive(DeriveIden)]
enum UserWord {
    Table,
    Id,
    MasterWordId,
    Stability,
    Difficulty,
    Due,
    LastReview,
    Status,
    AddedAt,
}
