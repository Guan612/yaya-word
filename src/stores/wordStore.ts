import { invoke } from "@tauri-apps/api/core";
import { MasterWord, ReviewCard } from "../types";
import { create } from "zustand";

interface WordState {
  masterWords: MasterWord[];
  reviewQueue: ReviewCard[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMasterWords: () => Promise<void>;
  //添加学习任务
  addToLearning: (masterId: number) => Promise<void>;
  //拉取学习任务
  fetchDueWords: () => Promise<void>;
  submitReview: (userWordId: number, ratingVal: number) => Promise<void>;
}

export const useWordStore = create<WordState>((set) => ({
  masterWords: [],
  reviewQueue: [],
  isLoading: false,
  error: null,

  fetchMasterWords: async () => {
    set({ isLoading: true, error: null });
    try {
      const words = await invoke<MasterWord[]>("get_all_master_words");
      console.log("Fetched words:", words); // 调试用
      set({ masterWords: words, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch words:", err);
      // Rust 返回的错误是一个字符串（因为我们 map_err 成了 String 或 ApiError 序列化后的样子）
      set({ error: String(err), isLoading: false });
    }
  },

  addToLearning: async (masterId: number) => {
    try {
      // 注意：Tauri 会自动把 JS 的驼峰命名 (masterId)
      // 映射到 Rust 的下划线命名 (master_id)
      await invoke("add_word_to_learning", { masterId });

      console.log(`Successfully added word ${masterId} to learning!`);
      // 这里未来可以加一个 Toast 提示或者更新本地状态，暂时先打印日志
    } catch (err) {
      console.error("Failed to add word:", err);
      // 这里也可以设置 error 状态，或者弹窗提示
    }
  },

  fetchDueWords: async () => {
    set({ isLoading: true, error: null });
    try {
      // 调用我们在 commands.rs 里写的 get_due_words
      const cards = await invoke<ReviewCard[]>("get_due_words");

      console.log("Due words fetched:", cards);
      set({ reviewQueue: cards, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch due words:", err);
      set({ error: String(err), isLoading: false });
    }
  },

  submitReview: async (ratingVal: number, userWordId: number) => {
    try {
      // 1. 调用后端
      // 关键：键名必须和 Rust 函数参数名对应 (驼峰转下划线)
      // Rust: user_word_id -> JS: userWordId
      // Rust: rating_val   -> JS: ratingVal
      await invoke("submit_review", {
        userWordId: userWordId,
        ratingVal: ratingVal,
      });

      // 2. 【关键优化】本地乐观更新
      // 提交成功后，立刻从复习队列中移除当前这张卡片，UI 会自动显示下一张
      set((state) => ({
        reviewQueue: state.reviewQueue.filter((card) => card.id !== userWordId),
      }));
    } catch (err) {
      console.error("Failed to submit review:", err);
      // 这里最好不要清空队列，只是打印错误，或者弹个 Toast
    }
  },
}));
