use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts

        manager
            .create_table(
                Table::create()
                    .table(MasterWords::Table)
                    .if_not_exists()
                    .col(pk_auto(Master_Words::Id))
                    .col(string(Master_Words::Text).not_null())
                    .col(string(Master_Words::Definition).not_null())
                    .col((Source::Text)(Master_Words::Source).not_null())
                    .col(string(Master_Words::Pronunciation))
                    .to_owned(),
            )
            .await?;

        manager.create_table(
            Table::create()
            .table(UserWord::Table)
        )
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        todo!();

        manager
            .drop_table(Table::drop().table(Post::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum MasterWord {
    Table,
    Id,
    Text,          //单词原文
    Definition,    //核心释义
    Source,        //单词来源
    Pronunciation, //音标
    Audio_Url,     //发音音频文件的链接
    Created_At,    //单词入库时间
}

#[derive(DeriveIden)]
enum UserWord {
    Table,
    Id,
    Word,
    Created_At,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(
    rs_type = "String",     // 在 Rust 代码中，我们把它当作 String 来处理
    db_type = "String(None)" // 在数据库中，它对应的列类型是 String (也就是 TEXT)
)]
pub enum Source {
    #[sea_orm(string_value = "ElementarySchool")] // 存入数据库时的字符串值
    ElementarySchool,
    #[sea_orm(string_value = "JuniorHighSchool")]
    JuniorHighSchool,
    #[sea_orm(string_value = "HighSchool")]
    HighSchool,
    #[sea_orm(string_value = "CET4")]
    Cet4,
    #[sea_orm(string_value = "CET6")]
    Cet6,
    #[sea_orm(string_value = "Custom")] // 用户自定义
    Custom,
    #[sea_orm(string_value = "Other")]
    Other,
}
