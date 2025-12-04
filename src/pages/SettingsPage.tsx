import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Slider,
  Typography,
} from "@mui/material";
import { useWordStore } from "../stores/wordStore";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { pushTime, dailyLimit, setPushTime, initSettings, setDailyLimit } =
    useWordStore();
  const [tempLimit, setTempLimit] = useState(dailyLimit);
  const [tempPushTime, setTempPushTime] = useState(pushTime);
  const [openWordContSettings, setOpenWordContSettings] = useState(false);
  const [openPushTimeSettings, setOpenPushTimeSettings] = useState(false);

  const handleSaveWordSettings = () => {
    setDailyLimit(tempLimit);
    setOpenWordContSettings(false);
  };

  const handleSavePushTimeSettings = () => {
    setPushTime(tempPushTime);
    setOpenPushTimeSettings(false);
  };

  useEffect(() => {
    initSettings();
  }, []);

  return (
    <div className="p-6">
      <Typography variant="h4" className="font-bold mb-4">
        设置
      </Typography>
      <div className="flex flex-col justify-center items-center">
        <Paper
          elevation={4}
          className="w-full p-5 rounded-2xl max-w-xl flex flex-col relative transition-all duration-200 justify-center my-2 border border-transparent hover:border-blue-100"
          onClick={() => {
            setOpenPushTimeSettings(true);
          }}
        >
          <div className="flex justify-between">
            <div className="font-bold">推送时间</div>
            <div>{pushTime}小时</div>
          </div>
        </Paper>
        <Paper
          elevation={4}
          className="w-full p-5 rounded-2xl max-w-xl flex flex-col relative transition-all duration-200 justify-center my-2 border border-transparent hover:border-blue-100"
          onClick={() => setOpenWordContSettings(true)}
        >
          <div className="flex justify-between">
            <div className="font-bold">每日记单词数量</div>
            <div>{dailyLimit}个</div>
          </div>
        </Paper>
      </div>
      {/* 设置每日单词弹窗 */}
      <Dialog
        open={openWordContSettings}
        onClose={() => setOpenWordContSettings(false)}
      >
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
          <Button onClick={() => setOpenWordContSettings(false)}>取消</Button>
          <Button onClick={handleSaveWordSettings} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
      {/* 设置推送时间弹窗 */}
      <Dialog
        open={openPushTimeSettings}
        onClose={() => setOpenPushTimeSettings(false)}
      >
        <DialogTitle>设置推送时间</DialogTitle>
        <DialogContent className="w-80 pt-4">
          <Typography gutterBottom>每 {tempPushTime} 小时推送</Typography>
          <Slider
            value={tempPushTime}
            onChange={(_, v) => setTempPushTime(v as number)}
            min={2}
            max={8}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPushTimeSettings(false)}>取消</Button>
          <Button onClick={handleSavePushTimeSettings} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
