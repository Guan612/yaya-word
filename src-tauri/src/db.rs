use std::fs;

use migration::{Migrator, MigratorTrait};
use sea_orm::{ConnectionTrait, Database, DatabaseBackend, DatabaseConnection, DbErr, Statement};
use tauri::{AppHandle, Manager};

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
    let count_res = db
        .query_one(Statement::from_string(
            DatabaseBackend::Sqlite,
            "SELECT count(*) as count FROM master_word",
        ))
        .await?;

    let count = count_res
        .map(|res| {
            // 尝试获取 count 列，不同数据库驱动返回类型可能不同，这里做一个简化的处理
            res.try_get::<i64>("", "count").unwrap_or(0)
        })
        .unwrap_or(0);

    if count > 0 {
        println!("Database already has data ({} rows), skipping seed.", count);
        return Ok(());
    }

    println!("Database is empty. Seeding test data...");

    let sql = r#"
    INSERT INTO master_word (text, definition, source, created_at)
    VALUES
        ('apple', 'n. 苹果', 'ElementarySchool', datetime('now')),
        ('banana', 'n. 香蕉', 'ElementarySchool', datetime('now')),
        ('abandon', 'v. 放弃', 'CET4', datetime('now')),
        ('tauri', 'n. 一个构建跨平台应用的框架', 'Custom', datetime('now'));
    "#;

    // 3. 执行插入
    db.execute(Statement::from_string(
        DatabaseBackend::Sqlite,
        sql
    )).await?;

    println!("✅ Test data seeded successfully!");

    Ok(())
}
