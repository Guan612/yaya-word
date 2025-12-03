import { useEffect, useRef, useState } from "react";
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
import { VolumeUp as VolumeUpIcon } from "@mui/icons-material";

export default function ReviewPage() {
  const { reviewQueue, isLoading, error, fetchDueWords, submitReview } =
    useWordStore();
  const { speak } = useTTS();

  // 本地状态：当前是否显示了答案
  const [showAnswer, setShowAnswer] = useState(false);

  // 【修改 1】不再使用 currentIndex，改用 finishedCount 记录进度
  const [finishedCount, setFinishedCount] = useState(0);

  // 【修改 2】增加 sessionTotal 锁定本次复习的总任务数
  const [sessionTotal, setSessionTotal] = useState(0);

  // 使用 useRef 避免 useEffect 闭包陷阱或重复设置
  const isInitialized = useRef(false);

  // 初始化加载数据
  useEffect(() => {
    fetchDueWords();
  }, []);

  // 【修改 3】监听队列变化，锁定初始总数
  useEffect(() => {
    // 只有当 sessionTotal 还没设置，且队列有数据时，才设置总数
    if (
      sessionTotal === 0 &&
      reviewQueue.length > 0 &&
      !isInitialized.current
    ) {
      setSessionTotal(reviewQueue.length);
      isInitialized.current = true;
    }
  }, [reviewQueue, sessionTotal]);

  const handleNext = async (rating: number) => {
    if (!currentCard) return;

    // 播放声音 (可选，看个人喜好)
    // speak(currentCard.text);

    // 【修改 4】提交逻辑
    // 如果不是 "忘记" (rating 1)，则视为进度+1
    // 如果是 "忘记"，因为卡片会被排到队尾重来，所以进度不增加
    if (rating !== 1) {
      setFinishedCount((prev) => prev + 1);
    }

    // 提交给 Store (Store 会负责把卡片移出队列或放到队尾)
    await submitReview(rating, currentCard.id);

    // 重置界面状态
    setShowAnswer(false);
  };

  // --- 状态渲染 ---

  if (isLoading && reviewQueue.length === 0) {
    return (
      <div className="flex center p-10">
        <CircularProgress />
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-10">Error: {error}</div>;

  // 【修改 5】完成判断：当队列为空时，才算完成
  if (reviewQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Typography variant="h2" className="mb-4">
          🎉
        </Typography>
        <Typography variant="h5" gutterBottom className="font-bold">
          太棒了！
        </Typography>
        <Typography color="text.secondary" className="mb-2">
          本次复习共完成 {finishedCount} 个单词
        </Typography>
        {/* 这里可以加个按钮返回首页 */}
      </div>
    );
  }

  // 【修改 6】永远取队列的第一个作为当前卡片
  // 因为 Store 会把处理完的卡片 shift 出去
  const currentCard = reviewQueue[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      {/* 进度提示 */}
      <Typography variant="caption" className="mb-4 text-gray-500">
        进度: {Math.min(finishedCount + 1, sessionTotal)} / {sessionTotal}
      </Typography>

      {/* 单词卡片 */}
      <Paper
        elevation={4}
        className="w-full max-w-md p-10 text-center rounded-2xl flex flex-col items-center min-h-[350px] justify-center relative transition-all duration-300"
      >
        {/* 正面：单词 */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                speak(currentCard.text);
              }}
              color="primary"
            >
              <VolumeUpIcon />
            </IconButton>
            <Typography variant="h3" className="font-bold text-gray-800">
              {currentCard.text}
            </Typography>
          </div>

          {currentCard.pronunciation && (
            <Typography variant="subtitle1" className="text-gray-500 font-mono">
              /{currentCard.pronunciation}/
            </Typography>
          )}
        </div>

        {/* 背面：释义 (只有点击显示答案后才出现) */}
        {showAnswer ? (
          <div className="animate-in fade-in zoom-in duration-300 mt-6 w-full border-t border-gray-100 pt-6">
            <Typography
              variant="h6"
              className="text-gray-700 mb-6 leading-relaxed"
            >
              {currentCard.definition}
            </Typography>

            <div className="flex gap-3 justify-center opacity-70">
              <Chip
                label={`难度: ${currentCard.difficulty.toFixed(1)}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`稳定: ${currentCard.stability.toFixed(1)}`}
                size="small"
                variant="outlined"
              />
            </div>
          </div>
        ) : (
          <Typography
            variant="body2"
            className="text-gray-300 mt-12 select-none cursor-pointer"
            onClick={() => setShowAnswer(true)}
          >
            (点击显示释义)
          </Typography>
        )}
      </Paper>

      {/* 底部操作栏 */}
      <Box className="mt-8 w-full max-w-md h-16">
        {!showAnswer ? (
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              setShowAnswer(true);
              speak(currentCard.text); // 显示答案时自动朗读
            }}
            className="h-14 text-lg font-bold rounded-xl shadow-lg"
          >
            显示答案
          </Button>
        ) : (
          // 评分按钮组
          <div className="grid grid-cols-4 gap-3 h-full">
            <Button
              variant="contained"
              color="error"
              className="rounded-xl"
              onClick={() => handleNext(1)} // Again
            >
              <div className="flex flex-col">
                <span className="font-bold text-lg">忘记</span>
                <span className="text-[10px] opacity-80">重来</span>
              </div>
            </Button>
            <Button
              variant="contained"
              color="warning"
              className="rounded-xl"
              onClick={() => handleNext(2)} // Hard
            >
              <div className="flex flex-col">
                <span className="font-bold text-lg">困难</span>
                <span className="text-[10px] opacity-80">较短</span>
              </div>
            </Button>
            <Button
              variant="contained"
              color="success"
              className="rounded-xl"
              onClick={() => handleNext(3)} // Good
            >
              <div className="flex flex-col">
                <span className="font-bold text-lg">良好</span>
                <span className="text-[10px] opacity-80">正常</span>
              </div>
            </Button>
            <Button
              variant="contained"
              color="info"
              className="rounded-xl"
              onClick={() => handleNext(4)} // Easy
            >
              <div className="flex flex-col">
                <span className="font-bold text-lg">简单</span>
                <span className="text-[10px] opacity-80">很久</span>
              </div>
            </Button>
          </div>
        )}
      </Box>
    </div>
  );
}
