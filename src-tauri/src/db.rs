use std::fs;

use sea_orm::{Database, DatabaseConnection, DbErr};
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

    // 5. 返回数据库连接池
    Ok(db)
}
