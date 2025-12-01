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
  Chip,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { GraphicEq } from "@mui/icons-material";
import useTTS from "../hooks/useTTS";

export default function WordListPage() {
  // 从 Store 中解构出我们需要的数据和方法
  const { masterWords, isLoading, error, fetchMasterWords, addToLearning } =
    useWordStore();
  const { speak } = useTTS();

  // 组件挂载时，自动拉取数据
  useEffect(() => {
    fetchMasterWords();
  }, [fetchMasterWords]);

  // 1. 加载中状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  // 2. 错误状态
  if (error) {
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  }

  // 3. 数据列表
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Typography variant="h4" className="mb-6 font-bold text-gray-800">
        主词库 ({masterWords.length})
      </Typography>

      <Paper elevation={2} className="rounded-xl overflow-hidden">
        <List>
          {masterWords.map((word, index) => (
            <div key={word.id}>
              <ListItem
                className="hover:bg-gray-50 transition-colors"
                secondaryAction={
                  <Tooltip title="加入学习计划">
                    <IconButton
                      edge="end"
                      aria-label="add"
                      color="primary"
                      onClick={() => addToLearning(word.id)}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={
                    <div className="flex items-center gap-3">
                      {/* 【新增】朗读小按钮 */}
                      <IconButton
                        size="small"
                        onClick={() => speak(word.text, word.audio_url)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <GraphicEq fontSize="small" />
                      </IconButton>
                      <span className="text-xl font-semibold text-blue-700">
                        {word.text}
                      </span>
                      {word.pronunciation && (
                        <span className="text-sm text-gray-500 font-mono">
                          /{word.pronunciation}/
                        </span>
                      )}
                      {word.source && (
                        <Chip
                          label={word.source}
                          size="small"
                          variant="outlined"
                          color="primary"
                          className="text-xs"
                        />
                      )}
                    </div>
                  }
                  secondary={
                    <span className="text-gray-700 mt-1 block">
                      {word.definition}
                    </span>
                  }
                />
              </ListItem>
              {/* 不是最后一行时显示分割线 */}
              {index < masterWords.length - 1 && <Divider component="li" />}
            </div>
          ))}
        </List>
      </Paper>
    </div>
  );
}
