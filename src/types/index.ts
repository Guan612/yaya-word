// 对应 Rust 后端的 master_word::Model
// 注意字段名要和 Rust struct 中的 pub 字段完全一致
export interface MasterWord {
  id: number;
  text: string;
  definition: string;
  source?: string; // Rust 中是 Option<String>，对应 TS 的 string | undefined
  pronunciation?: string;
  audio_url?: string;
  created_at: string; // 传过来通常是 ISO 8601 字符串
}

// 对应 Rust 后端的 ApiError
export interface ApiError {
  DatabaseError?: string;
  // 其他可能的错误类型
}

// 【新增】对应 Rust 后端的 ReviewCard
export interface ReviewCard {
  id: number; // user_words 表的主键 (用于更新进度)
  master_id: number; // 关联的主词 ID
  text: string; // 单词
  definition: string; // 释义
  pronunciation?: string;
  due: string; // 到期时间 ISO 字符串
  stability: number;
  difficulty: number;
}

export interface DashboardStats {
  total_master: number;
  total_learning: number;
  due_today: number;
}
