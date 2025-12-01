import { useEffect, useState } from "react";
import { useWordStore } from "../stores/wordStore";
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import useTTS from "../hooks/useTTS";
import { GraphicEq } from "@mui/icons-material";

export default function ReviewPage() {
  const { reviewQueue, isLoading, error, fetchDueWords, submitReview } =
    useWordStore();
  const { speak } = useTTS();

  // 本地状态：当前是否显示了答案
  const [showAnswer, setShowAnswer] = useState(false);

  // 本地状态：当前正在复习第几个单词（索引）
  const [currentIndex, setCurrentIndex] = useState(0);

  // 初始化加载数据
  useEffect(() => {
    fetchDueWords();
  }, [fetchDueWords]);

  // 【新增】当显示答案时，自动朗读 (可选功能，体验很好)
  useEffect(() => {
    if (showAnswer && reviewQueue[currentIndex]) {
      speak(reviewQueue[currentIndex].text);
    }
  }, [showAnswer, currentIndex, reviewQueue, speak]);

  const handleNext = (rating: number) => {
    setShowAnswer(false);
    // (真实的逻辑应该是提交评分给后端，然后后端更新数据库)
    submitReview(rating, currentCard.id);
  };

  if (isLoading)
    return (
      <div className="flex center p-10">
        <CircularProgress />
      </div>
    );
  if (error) return <div className="text-red-500 p-10">Error: {error}</div>;

  // 如果队列为空，或者索引超出了队列长度，说明今天没任务了
  if (reviewQueue.length === 0 || currentIndex >= reviewQueue.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Typography variant="h4" className="mb-4">
          🎉
        </Typography>
        <Typography variant="h5" gutterBottom>
          今日任务已完成！
        </Typography>
        <Typography color="text.secondary">
          去“发现单词”看看有没有新词想学吧。
        </Typography>
      </div>
    );
  }

  // 获取当前正在复习的卡片
  const currentCard = reviewQueue[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      {/* 进度提示 */}
      <Typography variant="caption" className="mb-4 text-gray-500">
        今日进度: {currentIndex + 1} / {reviewQueue.length}
      </Typography>

      {/* 单词卡片 */}
      <Paper
        elevation={4}
        className="w-full max-w-md p-10 text-center rounded-2xl flex flex-col items-center min-h-[300px] justify-center"
      >
        {/* 正面：单词 */}
        <div className="flex items-center gap-2 justify-center mb-2">
          <Typography variant="h3" className="font-bold text-gray-800">
            {currentCard.text}
          </Typography>

          {/* 【新增】手动朗读按钮 */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // 防止触发其他点击事件
              speak(currentCard.text, currentCard.audio_url);
            }}
            color="primary"
            size="large"
          >
            <GraphicEq fontSize="inherit" />
          </IconButton>
        </div>

        {currentCard.pronunciation && (
          <Typography
            variant="subtitle1"
            className="text-gray-500 font-mono mb-6"
          >
            /{currentCard.pronunciation}/
          </Typography>
        )}

        {/* 背面：释义 (只有点击显示答案后才出现) */}
        {showAnswer ? (
          <div className="animate-fade-in mt-4 border-t pt-6 w-full">
            <Typography variant="h6" className="text-gray-700 mb-4">
              {currentCard.definition}
            </Typography>

            <div className="flex gap-2 justify-center mt-2">
              <Chip
                label={`难度: ${currentCard.difficulty.toFixed(1)}`}
                size="small"
              />
              <Chip
                label={`稳定: ${currentCard.stability.toFixed(1)}`}
                size="small"
              />
            </div>
          </div>
        ) : (
          <Typography variant="body2" className="text-gray-400 mt-10">
            (思考一下含义...)
          </Typography>
        )}
      </Paper>

      {/* 底部操作栏 */}
      <Box className="mt-8 w-full max-w-md">
        {!showAnswer ? (
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setShowAnswer(true)}
            className="h-14 text-lg font-bold"
          >
            显示答案
          </Button>
        ) : (
          // 评分按钮组
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="contained"
              color="error" // 红色
              onClick={() => handleNext(1)} // 【修正】1 代表 Again (忘记)
            >
              忘记
              <br />
              {/* 注意：这里的 "1m" 只是占位符，实际时间由后端计算 */}
              <span className="text-xs opacity-70">重来</span>
            </Button>

            <Button
              variant="contained"
              color="warning" // 橙色
              onClick={() => handleNext(2)} // 【修正】2 代表 Hard (困难)
            >
              困难
              <br />
              <span className="text-xs opacity-70">较短</span>
            </Button>

            <Button
              variant="contained"
              color="success" // 绿色
              onClick={() => handleNext(3)} // 【修正】3 代表 Good (良好)
            >
              良好
              <br />
              <span className="text-xs opacity-70">正常</span>
            </Button>

            <Button
              variant="contained"
              color="info" // 蓝色
              onClick={() => handleNext(4)} // 【修正】4 代表 Easy (简单)
            >
              简单
              <br />
              <span className="text-xs opacity-70">很久</span>
            </Button>
          </div>
        )}
      </Box>
    </div>
  );
}
