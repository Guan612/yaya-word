import { invoke } from "@tauri-apps/api/core";
import { DashboardStats, MasterWord, ReviewCard } from "../types";
import { create } from "zustand";
import {
  addToLearningAPI,
  dashboardStatsAPI,
  dueWordsAPI,
  masterWordsAPI,
  masterWordsByFristLetterAPI,
  submitReviewAPI,
} from "../api";

interface WordState {
  masterWords: MasterWord[];
  reviewQueue: ReviewCard[];
  currentLetter: string;
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMasterWords: (letter?: string) => Promise<void>;
  //添加学习任务
  addToLearning: (masterId: number) => Promise<void>;
  //拉取学习任务
  fetchDueWords: () => Promise<void>;
  submitReview: (userWordId: number, ratingVal: number) => Promise<void>;
  fetchStats: () => void;
  // 【新增】设置当前字母并刷新数据
  setLetter: (letter: string) => void;
}

export const useWordStore = create<WordState>((set, get) => ({
  masterWords: [],
  reviewQueue: [],
  stats: null,
  isLoading: false,
  error: null,
  currentLetter: "A",

  setLetter: (letter: string) => {
    set({ currentLetter: letter });
    // 切换字母后，立即拉取新数据
    get().fetchMasterWords(letter);
  },

  fetchMasterWords: async (letter) => {
    set({ isLoading: true, error: null });
    try {
      const targetLetter = letter || get().currentLetter;
      const words = await masterWordsByFristLetterAPI(targetLetter);
      set({ masterWords: words, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch words:", err);
      // Rust 返回的错误是一个字符串（因为我们 map_err 成了 String 或 ApiError 序列化后的样子）
      set({ error: String(err), isLoading: false });
    }
  },

  addToLearning: async (masterId: number) => {
    try {
      await addToLearningAPI(masterId);

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
      const cards = await dueWordsAPI();
      set({ reviewQueue: cards, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch due words:", err);
      set({ error: String(err), isLoading: false });
    }
  },

  submitReview: async (ratingVal: number, userWordId: number) => {
    try {
      // 1. 调用后端
      await submitReviewAPI(ratingVal, userWordId);

      // 2. 【关键优化】本地乐观更新
      // 提交成功后，立刻从复习队列中移除当前这张卡片，UI 会自动显示下一张
      set((state) => {
        // 先把这张卡片找出来
        const currentCard = state.reviewQueue.find((c) => c.id === userWordId);
        // 把除了这张卡片以外的剩下的排好
        const remaining = state.reviewQueue.filter((c) => c.id !== userWordId);

        if (ratingVal == 1 && currentCard) {
          return { reviewQueue: [...remaining, currentCard] };
        } else {
          return { reviewQueue: remaining };
        }
      });
    } catch (err) {
      console.error("Failed to submit review:", err);
      // 这里最好不要清空队列，只是打印错误，或者弹个 Toast
    }
  },

  fetchStats: async () => {
    try {
      // 1. 调用 invoke，并告诉它返回的是 DashboardStats 类型
      // 2. 用 const data 接住返回值！
      const data = await dashboardStatsAPI();
      // 3. 将拿到的数据存入 Store
      set({ stats: data });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  },
}));
