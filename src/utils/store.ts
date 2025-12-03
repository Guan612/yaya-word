import { Store } from "@tauri-apps/plugin-store";
// 创建一个名为 "settings.json" 的存储文件
// 它会自动保存在用户的 AppData 目录下
let storeInstance: Store | null = null;

export const getStore = async () => {
  if (storeInstance) {
    return storeInstance;
  }

  // 尝试使用 load 方法
  storeInstance = await Store.load("settings.json");
  return storeInstance;
};
