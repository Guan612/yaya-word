use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Word {
    pub id: i64,
    pub text: String,
    pub definition: String,

    // --- 间隔重复系统 (SRS) 核心字段 ---
    // 这里我们不使用简单的“熟悉度”，而是采用更现代的 SRS 算法（如 FSRS）中的概念
    // 这会让你的 App 在记忆算法上更胜一筹
    pub stability: f32,                                     // 记忆稳定性 (天)
    pub difficulty: f32,                                    // 单词难度 (0-1)
    pub due: chrono::DateTime<chrono::Utc>,                 // 到期复习时间
    pub last_review: Option<chrono::DateTime<chrono::Utc>>, // 上次复习时间
    // --- 附加信息 ---
    pub notes: Option<String>,                     // 用户笔记
    pub created_at: chrono::DateTime<chrono::Utc>, // 创建时间
}
