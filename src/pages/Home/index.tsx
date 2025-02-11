import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: "视频工具集",
      icon: "video" as const,
      description:
        "一站式视频处理工具，支持视频格式转换、压缩、剪辑、提取音频等功能。简单易用，让视频处理变得更加高效。",
      link: "/video-tools", // 更新为路由路径
    },
    // ... 其他项目
  ];

  const handleProjectClick = (link: string) => {
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
  };

  // ... 其余代码保持不变，但需要将 Card 的 onClick 更新为 handleProjectClick
};

export default Home;
