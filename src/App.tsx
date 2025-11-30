// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// 引入布局和页面
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import WordListPage from "./pages/WordListPage";
import ReviewPage from "./pages/ReviewPage";
import SettingsPage from "./pages/SettingsPage"; // 假设你创建了这个文件

// 创建一个全局主题 (可选，但推荐)
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb", // Tailwind blue-600
    },
    background: {
      default: "#f9fafb", // Tailwind gray-50
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    // 可以在这里全局覆盖 MUI 组件样式
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: "8px" },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* 标准化 CSS */}
      <BrowserRouter>
        <Routes>
          {/* 使用 MainLayout 作为父路由 */}
          <Route element={<MainLayout />}>
            {/* 子路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/list" element={<WordListPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* 404 处理 (可选) */}
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
