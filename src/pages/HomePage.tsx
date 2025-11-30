import { Typography, Paper } from "@mui/material";

export default function HomePage() {
  return (
    <div className="p-6">
      <Typography variant="h4" className="font-bold mb-4">
        概览
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Paper className="p-6 rounded-xl bg-blue-50">
          <Typography variant="h6">今日待复习</Typography>
          <Typography variant="h3" className="text-blue-600 font-bold">
            12
          </Typography>
        </Paper>
        <Paper className="p-6 rounded-xl bg-green-50">
          <Typography variant="h6">已掌握单词</Typography>
          <Typography variant="h3" className="text-green-600 font-bold">
            85
          </Typography>
        </Paper>
      </div>
    </div>
  );
}
