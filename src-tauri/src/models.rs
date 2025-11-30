use serde::{Deserialize, Serialize};

use crate::entities::master_word;
use crate::entities::user_word;

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

#[derive(Debug, Serialize)]
pub struct ReviewCard {
    pub id: i32,
    pub stability: f32,
    pub difficulty: f32,
    pub due: String, //时间序列为字符串

    // 来自 master_words 的内容信息
    pub master_id: i32,
    pub text: String,
    pub definition: String,
    pub pronunciation: Option<String>,
}

impl ReviewCard {
    pub fn from_query_result(
        user: user_word::Model,
        master: Option<master_word::Model>,
    ) -> Option<Self> {
        let master = master?;

        Some(Self {
            id: user.id,
            stability: user.stability,
            difficulty: user.difficulty,
            due: user.due.to_rfc3339(), // 转为 ISO 时间字符串

            master_id: master.id,
            text: master.text,
            definition: master.definition,
            pronunciation: master.pronunciation,
        })
    }
}
