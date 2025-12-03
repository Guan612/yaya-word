import { useCallback, useEffect, useState } from "react";
import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { exists } from "@tauri-apps/plugin-fs";

const useTTs = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis?.getVoices() || [];
      setVoices(available);
    };

    // 先尝试加载一次
    loadVoices();

    // 监听 Chrome 的异步加载
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null; // 清理
    };
  }, []);

  const speak = useCallback(
    async (text: string, audioFileName?: string) => {
      // 1. 停止当前正在播放的声音 (避免重叠)
      window.speechSynthesis.cancel();

      //优先尝试本地音频播放 好像暂时不行
      //   if (audioFileName) {
      //     try {
      //       // A. 计算资源文件的真实路径
      //       // 注意：Tauri 打包后，resources 目录结构会保持
      //       const resourcePath = await resolveResource(
      //         `resources/audio/${audioFileName}`
      //       );

      //       // B. 检查文件是否存在
      //       if (await exists(resourcePath)) {
      //         // 【修改】Windows 路径修复：把反斜杠 \ 强制替换为正斜杠 /
      //         // 浏览器对 URL 中的 \ 兼容性不好，容易导致解析错误
      //         //const safePath = resourcePath.replace(/\\/g, '/');

      //         //const assetUrl = convertFileSrc(safePath);

      //         // C. 将本地路径转换为浏览器可访问的 URL (asset://...)
      //         const assetUrl = convertFileSrc(resourcePath);

      //         // D. 播放
      //         const audio = new Audio(assetUrl);
      //         await audio.play();
      //         return; // 播放成功，直接返回，不走 TTS
      //       }
      //     } catch (err) {
      //       console.warn("Failed to play local audio:", err);
      //     }
      //   }
      if (!text) return;
      // 2. 创建发音请求
      const utterance = new SpeechSynthesisUtterance(text);

      // 3. 尝试寻找最好的英文语音
      // 优先级：Google US -> Microsoft US -> 任意英文 -> 默认
      const preferredVoice =
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("US English")) ||
        voices.find((v) => v.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // 设置一些参数 (语速、音调)
      utterance.rate = 1;
      utterance.pitch = 1;

      // 4. 播放
      window.speechSynthesis.speak(utterance);
    },
    [voices]
  );

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, cancel };
};

export default useTTs;
