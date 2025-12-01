import { Typography, Paper, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useWordStore } from "../stores/wordStore";

export default function HomePage() {
  const { stats, fetchStats } = useWordStore();
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  return (
    <div className="p-6">
      <Typography variant="h4" className="font-bold mb-4">
        概览
      </Typography>
      {/* 如果数据还没回来 (是 null)，显示加载圈，或者是 0 */}
      {!stats ? (
        <div className="p-10">
          <CircularProgress />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Paper className="p-6 rounded-xl bg-blue-50">
            <Typography variant="h6" className="text-gray-600">
              今日待复习
            </Typography>
            <Typography variant="h2" className="text-blue-600 font-bold my-2">
              {stats.due_today}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              加油，保持从容！
            </Typography>
          </Paper>

          <Paper className="p-6 rounded-xl bg-green-50">
            <Typography variant="h6" className="text-gray-600">
              正在学习
            </Typography>
            <Typography variant="h2" className="text-green-600 font-bold my-2">
              {stats.total_learning}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              总词库: {stats.total_master}
            </Typography>
          </Paper>
        </div>
      )}
    </div>
  );
}
