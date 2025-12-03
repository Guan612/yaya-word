import { useEffect, useState } from "react";
import { useWordStore } from "../stores/wordStore";
import { useNavigate } from "react-router";
import {
  Typography,
  Paper,
  CircularProgress,
  Button,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";

export default function HomePage() {
  const {
    stats,
    fetchStats,
    startDailySession,
    dailyLimit,
    setDailyLimit,
    initSettings,
  } = useWordStore();
  const navigate = useNavigate();

  // 控制设置弹窗
  const [openSettings, setOpenSettings] = useState(false);
  const [tempLimit, setTempLimit] = useState(dailyLimit);

  useEffect(() => {
    fetchStats();
    initSettings();
    console.log(tempLimit);
  }, []);

  // 点击“开始学习”
  const handleStart = async () => {
    // 1. 调用生成逻辑 + 拉取队列
    await startDailySession();
    // 2. 跳转到复习页
    navigate("/review");
  };

  const handleSaveSettings = () => {
    setDailyLimit(tempLimit);
    setOpenSettings(false);
  };

  if (!stats)
    return (
      <div className="p-10 flex justify-center">
        <CircularProgress />
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 顶部欢迎区 */}
      <div className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-800">
          早安，学习者！👋
        </Typography>
        <Typography className="text-gray-500 mt-1">
          今天也要保持进步。
        </Typography>
      </div>

      {/* 核心操作卡片 */}
      <Paper
        elevation={0}
        className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden"
      >
        <div className="relative z-10">
          <Typography variant="h6" className="opacity-90 mb-1">
            今日任务
          </Typography>
          <div className="flex items-baseline gap-2">
            <Typography variant="h2" className="font-bold">
              {stats.due_today}
            </Typography>
            <Typography variant="body1" className="opacity-80">
              个单词待复习
            </Typography>
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              variant="contained"
              color="inherit" // 使用白色背景
              className="text-blue-600 font-bold px-6 py-2 rounded-lg shadow-md hover:bg-gray-100"
              startIcon={<PlayCircleFilledWhiteIcon />}
              onClick={handleStart}
            >
              开始背单词
            </Button>

            <Button
              variant="text"
              className="text-white hover:bg-white/10"
              onClick={() => setOpenSettings(true)}
            >
              调整新词量 ({dailyLimit})
            </Button>
          </div>
        </div>

        {/* 装饰背景 */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <PlayCircleFilledWhiteIcon style={{ fontSize: 200 }} />
        </div>
      </Paper>

      {/* 数据概览 */}
      <div className="grid grid-cols-2 gap-4">
        <Paper className="p-5 rounded-xl border border-gray-100 shadow-sm">
          <Typography variant="body2" className="text-gray-500">
            累计在学
          </Typography>
          <Typography variant="h4" className="font-bold text-gray-800 mt-1">
            {stats.total_learning}
          </Typography>
        </Paper>
        <Paper className="p-5 rounded-xl border border-gray-100 shadow-sm">
          <Typography variant="body2" className="text-gray-500">
            词库总量
          </Typography>
          <Typography variant="h4" className="font-bold text-gray-800 mt-1">
            {stats.total_master}
          </Typography>
        </Paper>
      </div>

      {/* 设置弹窗 */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
        <DialogTitle>设置每日新词量</DialogTitle>
        <DialogContent className="w-80 pt-4">
          <Typography gutterBottom>每天学习 {tempLimit} 个新单词</Typography>
          <Slider
            value={tempLimit}
            onChange={(_, v) => setTempLimit(v as number)}
            min={5}
            max={50}
            step={5}
            marks
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>取消</Button>
          <Button onClick={handleSaveSettings} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
