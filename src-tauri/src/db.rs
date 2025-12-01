use crate::entities::{master_word, prelude::MasterWord};
use chrono::Utc;
use migration::{Migrator, MigratorTrait};
use sea_orm::{
    ActiveValue::Set, ConnectionTrait, Database, DatabaseBackend, DatabaseConnection, DbErr,
    EntityTrait, PaginatorTrait, Statement,
};
use serde::Deserialize;
use std::fs;
use tauri::{AppHandle, Manager};

#[derive(Debug, Deserialize)]
struct JsonTranslation {
    translation: String,
    #[serde(rename = "type")] // "type" 是 Rust 关键字，所以要改名映射
    word_type: Option<String>,
}

#[derive(Debug, Deserialize)]
struct JsonPhrase {
    phrase: String,
    translation: String,
}

#[derive(Debug, Deserialize)]
struct JsonWord {
    word: String,
    translations: Vec<JsonTranslation>,
    // phrases 可能为空或不存在，用 Option
    phrases: Option<Vec<JsonPhrase>>,
}

pub async fn init(app_hadle: &AppHandle) -> Result<DatabaseConnection, DbErr> {
    // 1. 获取应用的数据目录
    let data_dir = app_hadle
        .path()
        .app_local_data_dir()
        .expect("找不到本地数据");

    // --- 【关键修复 1】打印路径，方便调试 ---
    println!("Database path will be: {:?}", data_dir);

    // 确保这个目录存在
    if !data_dir.exists() {
        println!("Directory does not exist, creating: {:?}", data_dir);
        fs::create_dir_all(&data_dir).expect("无法创建app本地存储");
    }

    // 2. 构建 SQLite 数据库文件的完整路径
    let db_path = data_dir.join("yaya-word.db");
    let db_url = format!("sqlite://{}?mode=rwc", db_path.to_str().unwrap());

    // 3. 连接数据库
    let db = Database::connect(&db_url).await?;
    println!("Database connected at: {}", db_url);

    println!("Running migrations...");
    Migrator::up(&db, None).await?;
    println!("Migrations applied.");

    // 5. 返回数据库连接池
    Ok(db)
}

//插入假数据函数
pub async fn seed(db: &DatabaseConnection) -> Result<(), DbErr> {
    let count = MasterWord::find().count(db).await?;
    if count > 0 {
        println!("Database already has data ({} rows), skipping seed.", count);
        return Ok(());
    }
    println!("Database is empty. Seeding from JSON...");

    // B. 【核心】在编译时读取 JSON 文件
    // 注意路径：相对于当前 .rs 文件的位置，或者项目根目录
    // 假设 db.rs 在 src-tauri/src/，json 在 src-tauri/assets/
    let json_data = include_str!("../assets/high_school_words.json");
    let words: Vec<JsonWord> = serde_json::from_str(json_data).expect("Failed to parse words.json");
    println!(
        "Found {} words in JSON. Preparing to insert...",
        words.len()
    );

    // D. 数据转换：JsonWord -> master_word::ActiveModel
    // 为了防止一次插入太多导致 SQLite 报错，我们可以分批插入，比如每批 100 个
    let batch_size = 100;
    let mut batch: Vec<master_word::ActiveModel> = Vec::new();

    for word in words {
        let definition_str = word
            .translations
            .iter()
            .map(|t| {
                match &t.word_type {
                    Some(wt) => format!("{}. {}", wt, t.translation),
                    None => format!("{}", t.translation), // 或者 format!("未知. {}", t.translation)
                }
            })
            .collect::<Vec<String>>()
            .join("/n");

        let active_model = master_word::ActiveModel {
            text: Set(word.word),
            definition: Set(definition_str),
            source: Set(Some("高中".to_owned())), // 标记来源
            audio_url: Set(None),                 // 暂时没有音频
            pronunciation: Set(None),             // JSON 里没音标，暂时留空
            created_at: Set(Utc::now().into()),
            ..Default::default() // ID 自增
        };

        batch.push(active_model);

        if batch.len() >= batch_size {
            MasterWord::insert_many(batch.clone()).exec(db).await?;
            batch.clear();
        }
    }

    if !batch.is_empty() {
        MasterWord::insert_many(batch).exec(db).await?;
    }

    println!("✅ Data seeded successfully!");

    Ok(())
}
