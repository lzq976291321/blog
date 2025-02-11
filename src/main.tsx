import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 如果需要配置 antd 主题或其他全局配置
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

// 全局样式引入
import "antd/dist/reset.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
