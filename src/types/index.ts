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
