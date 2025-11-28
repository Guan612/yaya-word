import { invoke } from "@tauri-apps/api/core";
import { MasterWord } from "../types";
import { create } from "zustand";

interface WordState {
  masterWords: MasterWord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMasterWords: () => Promise<void>;
}

export const useWordStore = create<WordState>((set) => ({
  masterWords: [],
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
}));
