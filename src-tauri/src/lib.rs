use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod algorithm;
mod commands;
mod db;
pub mod entities;
pub mod error;
mod models;
mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_tts::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init());

    builder
        .setup(|app| setup_database(app))
        .invoke_handler(tauri::generate_handler![
            commands::get_all_master_words,
            commands::get_master_word_by_first_letter,
            commands::get_words_list_filiter,
            commands::search_master_words,
            commands::add_word_to_learning,
            commands::generate_new_words,
            commands::get_due_words,
            commands::submit_review,
            commands::get_dashboard_stats,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup_database(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let handel = app.handle().clone();
    tauri::async_runtime::block_on(async move {
        // 调用 db::init 函数并等待它完成
        let db_conn = db::init(&handel)
            .await
            .expect("Database initialization failed");

        //注入数据
        db::seed(&db_conn).await.expect("Failed to seed database");

        // 将数据库连接池放入 Tauri 的状态管理器中
        handel.manage(db_conn);
    });
    Ok(())
}
