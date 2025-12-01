import { invoke } from "@tauri-apps/api/core";
import { DashboardStats, MasterWord, ReviewCard } from "../types";

export const dueWordsAPI = () => {
  return invoke<ReviewCard[]>("get_due_words");
};

export const masterWordsAPI = () => {
  return invoke<MasterWord[]>("get_all_master_words");
};

export const masterWordsByFristLetterAPI = (letter?: string) => {
  // 传入 Option<String> 给 Rust，对应 JS 的 string | null
  return invoke<MasterWord[]>("get_master_word_by_first_letter", {
    letter: letter || null,
  });
};

export const dashboardStatsAPI = () => {
  return invoke<DashboardStats>("get_dashboard_stats");
};

// 注意：Tauri 会自动把 JS 的驼峰命名 (masterId)
// 映射到 Rust 的下划线命名 (master_id)
export const addToLearningAPI = (masterId: number) => {
  return invoke("add_word_to_learning", { masterId });
};

// 关键：键名必须和 Rust 函数参数名对应 (驼峰转下划线)
// Rust: user_word_id -> JS: userWordId
// Rust: rating_val   -> JS: ratingVal
export const submitReviewAPI = (ratingVal: number, userWordId: number) => {
  return invoke("submit_review", {
    userWordId: userWordId,
    ratingVal: ratingVal,
  });
};
