// src/hooks/useTTS.ts

import { useCallback, useEffect, useState, useRef } from "react";
import { platform } from "@tauri-apps/plugin-os";
import { invoke } from "@tauri-apps/api/core";

export const useTTS = () => {
  // 仅桌面端需要用到的状态
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // 使用 useRef 避免闭包陷阱，保证在回调中能拿到最新的 voices
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // 1. 初始化：检测平台并根据平台执行不同的初始化逻辑
  useEffect(() => {
    const osName = platform();
    const _isMobile = osName === 'android' || osName === 'ios';
    setIsMobile(_isMobile);
    console.log(`TTS Engine Strategy: ${_isMobile ? 'Native Plugin' : 'Web Speech API'}`);

    // 【优化点 1】如果是移动端，直接结束，完全不触碰浏览器 TTS API，避免任何潜在报错
    if (_isMobile) return;

    // --- 以下仅在桌面端执行 ---
    const synth = window.speechSynthesis;
    if (!synth) {
      console.warn("Web Speech API not supported.");
      return;
    }

    const loadVoices = () => {
      const available = synth.getVoices() || [];
      setVoices(available);
      voicesRef.current = available; // 更新 ref
    };

    loadVoices();
    // 桌面端 Chrome 需要监听这个事件
    try {
      synth.onvoiceschanged = loadVoices;
    } catch (e) {
      // 忽略错误
    }

    return () => {
      if (synth) synth.onvoiceschanged = null;
    };
  }, []);

  // 【优化点 2】抽取纯函数：寻找最佳语音 (桌面端专用)
  const getPreferredVoice = (voiceList: SpeechSynthesisVoice[]) => {
    return (
      voiceList.find((v) => v.name.includes("Google US English")) ||
      voiceList.find((v) => v.name.includes("US English")) ||
      voiceList.find((v) => v.lang.startsWith("en"))
    );
  };

  // 2. 核心发音函数
  const speak = useCallback(async (text: string) => {
    if (!text) return;

    // --- 分支 A：移动端 (调用 Rust 插件) ---
    if (isMobile) {
      try {
        await invoke("plugin:tts|speak", { text });
      } catch (e) {
        console.error("Native TTS failed:", e);
      }
      return;
    }

    // --- 分支 B：桌面端 (调用浏览器 API) ---
    const synth = window.speechSynthesis;
    if (!synth) return;

    try {
      synth.cancel(); // 打断当前

      const utterance = new SpeechSynthesisUtterance(text);
      
      // 使用 ref 获取最新的语音列表，避免依赖 stale closure
      const bestVoice = getPreferredVoice(voicesRef.current);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;

      synth.speak(utterance);
    } catch (e) {
      console.error("Web Speech API failed:", e);
    }
  }, [isMobile]); // 依赖项非常少，性能更好

  // 3. 取消播放
  const cancel = useCallback(async () => {
    if (isMobile) {
      try {
        // 尝试调用插件的停止方法 (假设插件支持 stop)
        // await invoke("plugin:tts|stop");
        // 注意：如果你用的插件不支持 stop，这里留空即可，或者查阅插件文档
      } catch (e) {}
    } else {
      window.speechSynthesis?.cancel();
    }
  }, [isMobile]);

  return { speak, cancel };
};

export default useTTS;