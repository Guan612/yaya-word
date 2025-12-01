// src/layouts/MainLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Home as HomeIcon,
  Book as BookIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useState } from "react";

// 定义导航项配置，方便复用
const NAV_ITEMS = [
  { label: "首页", path: "/", icon: <HomeIcon /> },
  { label: "发现单词", path: "/list", icon: <BookIcon /> },
  { label: "开始复习", path: "/review", icon: <SchoolIcon /> },
  { label: "设置", path: "/settings", icon: <SettingsIcon /> },
];

const DRAWER_WIDTH = 240;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // 使用 MUI 的 hook 判断是否为移动端 (屏幕宽度小于 sm 断点，通常是 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 桌面端侧边栏的展开/收起状态 (可选)
  const [mobileOpen, setMobileOpen] = useState(false);

  // 处理导航跳转
  const handleNavChange = (newValue: string) => {
    navigate(newValue);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* --- 1. 顶部标题栏 (AppBar) --- */}
      {/* 在移动端显示，桌面端可选显示 */}
      <AppBar
        position="fixed"
        className="bg-white text-gray-800 shadow-sm z-50"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          display: { xs: "block", sm: "none" }, // 仅在移动端显示顶部栏，或者你可以一直显示
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" className="font-bold">
            Yaya Word
          </Typography>
        </Toolbar>
      </AppBar>

      {/* --- 2. 桌面端侧边栏 (Desktop Drawer) --- */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid #eee",
            },
          }}
          open
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <Typography variant="h5" className="font-bold text-blue-600">
              鸭鸭单词
            </Typography>
          </div>
          <List className="mt-2">
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavChange(item.path)}
                  className="mx-2 rounded-lg"
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                    },
                    "&:hover": { backgroundColor: "#f3f4f6" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        location.pathname === item.path ? "#1d4ed8" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      )}

      {/* --- 3. 主内容区域 (Main Content) --- */}
      <main
        className="flex-1 overflow-auto w-full"
        style={{
          // 移动端：为了不被顶部 AppBar 和底部 Nav 遮挡，需要加 padding
          // 桌面端：不需要这些 padding
          paddingTop: isMobile ? "56px" : "0",
          paddingBottom: isMobile ? "56px" : "0",
        }}
      >
        {/* 这里渲染具体的页面 */}
        <Outlet />
      </main>

      {/* --- 4. 移动端底部导航 (Mobile Bottom Nav) --- */}
      {isMobile && (
        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(_, newValue) => handleNavChange(newValue)}
          >
            {NAV_ITEMS.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                value={item.path}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </div>
  );
}
