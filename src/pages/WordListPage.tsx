// src/pages/WordListPage.tsx

import { useEffect } from "react";
import { useWordStore } from "../stores/wordStore";
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import {
  AddCircleOutline as AddIcon,
  VolumeUp as VolumeUpIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import useTTS from "../hooks/useTTS";

// 生成 A-Z 的字母数组
const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

export default function WordListPage() {
  const {
    masterWords,
    isLoading,
    error,
    currentLetter,
    fetchMasterWords,
    addToLearning,
    setLetter,
  } = useWordStore();

  const { speak } = useTTS();

  // 组件首次加载时，如果没有数据，默认拉取当前选中字母（默认为 A）的数据
  useEffect(() => {
    // 这里的逻辑是：如果当前列表为空，或者你想确保每次进来都刷新，都可以调用
    // 由于我们在 Store 的 setLetter 里已经做了拉取逻辑，这里主要是为了处理第一次进入页面
    fetchMasterWords();
  }, []); // 依赖项为空，只在挂载时执行一次

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative">
      {/* ---------------- 左侧：主要内容区域 ---------------- */}
      <div
        className="flex-1 h-full overflow-y-auto scroll-smooth"
        id="word-list-container"
      >
        <div className="p-4 md:p-6 pb-20">
          {" "}
          {/* pb-20 防止底部内容被移动端导航栏遮挡 */}
          {/* 顶部标题栏 (Sticky) */}
          <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-3 mb-2 flex items-baseline justify-between border-b border-gray-200">
            <Typography variant="h4" className="font-bold text-gray-800">
              {currentLetter}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              收录 {masterWords.length} 个单词
            </Typography>
          </div>
          {/* 状态处理：加载中 */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <CircularProgress size={40} />
              <Typography className="mt-4 text-gray-400 text-sm">
                正在加载词库...
              </Typography>
            </div>
          ) : error ? (
            /* 状态处理：出错 */
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <ErrorIcon fontSize="large" className="mb-2" />
              <Typography>加载失败: {error}</Typography>
            </div>
          ) : (
            /* 状态处理：正常显示列表 */
            <Paper elevation={0} className="bg-transparent">
              <List className="space-y-3">
                {masterWords.map((word) => (
                  <Paper
                    key={word.id}
                    elevation={1}
                    className="rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <ListItem
                      className="bg-white"
                      // 右侧操作区：加入学习按钮
                      secondaryAction={
                        <Tooltip title="加入学习计划">
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => addToLearning(word.id)}
                            className="hover:bg-blue-50"
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemText
                        primary={
                          <div className="flex items-center gap-3 mb-1">
                            {/* 单词前的发音按钮 */}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                speak(word.text); // 如果有 audio_url 可以在这里传入第二个参数
                              }}
                              className="text-gray-400 hover:text-blue-500 -ml-2"
                            >
                              <VolumeUpIcon fontSize="small" />
                            </IconButton>

                            {/* 单词拼写 */}
                            <span className="text-xl font-bold text-gray-800 tracking-wide">
                              {word.text}
                            </span>

                            {/* 音标 (如果有) */}
                            {word.pronunciation && (
                              <span className="text-sm text-gray-400 font-mono hidden sm:inline-block">
                                /{word.pronunciation}/
                              </span>
                            )}
                          </div>
                        }
                        secondary={
                          <Box component="div">
                            {/* 来源标签 */}
                            {word.source && (
                              <Chip
                                label={word.source}
                                size="small"
                                variant="outlined"
                                className="mb-1 mr-2 text-xs border-gray-200 text-gray-500 h-5"
                              />
                            )}
                            {/* 释义 */}
                            <span className="text-gray-600 block leading-relaxed">
                              {word.definition}
                            </span>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Paper>
                ))}

                {/* 空状态：该字母下没有单词 */}
                {!isLoading && masterWords.length === 0 && (
                  <div className="text-center py-20 text-gray-400">
                    <Typography variant="h6">这里空空如也</Typography>
                    <Typography variant="body2">
                      词库中没有以 <strong>{currentLetter}</strong> 开头的单词
                    </Typography>
                  </div>
                )}
              </List>
            </Paper>
          )}
        </div>
      </div>

      {/* ---------------- 右侧：字母索引导航栏 ---------------- */}
      <div className="w-10 sm:w-12 h-full bg-white border-l border-gray-200 shadow-lg z-20 flex flex-col items-center shrink-0">
        <div className="flex-1 w-full overflow-y-auto no-scrollbar py-4 flex flex-col items-center gap-1">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setLetter(letter)}
              className={`
                w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-200 select-none
                ${
                  currentLetter === letter
                    ? "bg-blue-600 text-white shadow-md scale-110"
                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                }
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
