import { DashboardStats, MasterWord, ReviewCard } from "../types";
import { create } from "zustand";
import { getStore } from "../utils/store"; // 引入刚才创建的实例
import {
  addToLearningAPI,
  dashboardStatsAPI,
  dueWordsAPI,
  generateNewWordsAPI,
  getWordsListFiliterAPI,
  masterWordsAPI,
  masterWordsByFristLetterAPI,
  searchWordsAPI,
  submitReviewAPI,
} from "../api";

interface WordState {
  masterWords: MasterWord[];
  reviewQueue: ReviewCard[];
  currentLetter: string;
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean; // 是否还有更多数据

  // 搜索状态
  isSearching: boolean; // 当前是否在搜索模式

  dailyLimit: number; // 【新增】设置：每天学多少个

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

  loadMoreWords: () => Promise<void>; // 加载下一页
  searchWords: (keyword: string) => Promise<void>; // 搜索
  resetList: () => Promise<void>; // 重置回列表模式
  initSettings: () => Promise<void>; // 【新增】初始化加载
  setDailyLimit: (limit: number) => Promise<void>;
  startDailySession: () => Promise<void>; // 【核心】一键开始
}

export const useWordStore = create<WordState>((set, get) => ({
  masterWords: [],
  reviewQueue: [],
  stats: null,
  isLoading: false,
  error: null,
  currentLetter: "#",
  page: 0,
  hasMore: true,
  isSearching: false,
  dailyLimit: 15,

  setLetter: (letter: string) => {
    set({ currentLetter: letter });
    // 切换字母后，立即拉取新数据
    if (letter === "#") {
      // 如果是 #，重置回无限滚动列表（即 page=0，重新加载）
      get().resetList();
    } else {
      // 如果是字母，调用按字母查询的接口
      get().fetchMasterWords(letter);
    }
  },

  // 2. 【新增】初始化设置
  // 这个方法需要在 App 启动时（比如 HomePage 的 useEffect）调用一次
  initSettings: async () => {
    try {
      // 从 settings.json 读取
      const store = await getStore(); // 获取实例
      const savedLimit = await store.get<number>("daily_limit");

      // 如果读取到了，就更新状态
      if (savedLimit) {
        console.log("Loaded settings:", savedLimit);
        set({ dailyLimit: savedLimit });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  },

  // 【新增】修改设置
  setDailyLimit: async (limit: number) => {
    // A. 更新内存状态 (让 UI 立即反应)
    set({ dailyLimit: limit });

    try {
      // B. 写入磁盘
      const store = await getStore(); // 获取实例
      await store.set("daily_limit", limit);
      await store.save();
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
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

  // 1. 加载更多 (无限滚动核心)
  loadMoreWords: async () => {
    // 如果正在加载、没有更多数据、或者处于搜索模式，就不要加载更多
    if (get().isLoading || !get().hasMore || get().isSearching) return;

    set({ isLoading: true });
    try {
      const currentPage = get().page;
      const limit = 20;

      const newWords = await getWordsListFiliterAPI(currentPage, limit);

      set((state) => ({
        // 【关键】追加数据，而不是覆盖
        masterWords: [...state.masterWords, ...newWords],
        page: state.page + 1,
        isLoading: false,
        // 如果取回来的数据少于 limit，说明到底了
        hasMore: newWords.length === limit,
      }));
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  // 2. 搜索功能
  searchWords: async (keyword: string) => {
    if (!keyword.trim()) {
      // 如果关键词为空，这就相当于“重置”
      get().resetList();
      return;
    }

    set({ isLoading: true, isSearching: true });
    try {
      const results = await searchWordsAPI(keyword);
      set({
        masterWords: results, // 搜索模式下是覆盖数据
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  // 3. 重置回普通列表
  resetList: async () => {
    set({
      masterWords: [],
      page: 0,
      hasMore: true,
      isSearching: false,
      isLoading: false,
    });
    // 立即加载第一页
    get().loadMoreWords();
  },

  // 【新增】开始今日学习
  startDailySession: async () => {
    set({ isLoading: true });
    try {
      const limit = get().dailyLimit;

      // 1. 请求后端生成新词
      // 注意：这会把新词插入数据库，due 为现在
      const newCount = await generateNewWordsAPI(limit);
      console.log(`Generated ${newCount} new words`);

      // 2. 直接复用现有的 fetchDueWords
      // 因为新词的 due 是 now，所以它们会被 fetchDueWords 一起拉下来
      // 这样复习队列里就包含了：旧的复习词 + 刚生成的今日新词
      await get().fetchDueWords();
    } catch (err) {
      console.error("Failed to start session:", err);
      set({ error: String(err), isLoading: false });
    }
  },
}));
