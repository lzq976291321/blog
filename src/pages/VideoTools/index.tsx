import React from "react";
import { Layout, Typography, Row, Col, Card } from "antd";
import { motion } from "framer-motion";
import {
  ScissorOutlined,
  CompressOutlined,
  SwapOutlined,
  AudioOutlined,
  DownloadOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import styles from "./VideoTools.module.less";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

interface ToolCategory {
  title: string;
  tools: {
    icon: React.ReactNode;
    name: string;
    description: string;
    backgroundColor: string;
  }[];
}

const VideoTools: React.FC = () => {
  const categories: ToolCategory[] = [
    {
      title: "基础工具",
      tools: [
        {
          icon: <ScissorOutlined />,
          name: "视频剪辑",
          description: "快速剪辑视频片段，支持精确到帧的剪辑控制",
          backgroundColor: "#e6f7ff",
        },
        {
          icon: <CompressOutlined />,
          name: "视频压缩",
          description: "智能压缩视频文件大小，保持画质清晰度",
          backgroundColor: "#f6ffed",
        },
      ],
    },
    {
      title: "格式转换",
      tools: [
        {
          icon: <SwapOutlined />,
          name: "格式转换",
          description: "支持多种视频格式之间的相互转换",
          backgroundColor: "#fff7e6",
        },
        {
          icon: <AudioOutlined />,
          name: "提取音频",
          description: "从视频中提取音频文件，支持多种音频格式",
          backgroundColor: "#fff0f6",
        },
      ],
    },
    {
      title: "高级功能",
      tools: [
        {
          icon: <DownloadOutlined />,
          name: "视频下载",
          description: "支持多平台视频下载，自动选择最佳画质",
          backgroundColor: "#f9f0ff",
        },
        {
          icon: <RetweetOutlined />,
          name: "批量处理",
          description: "同时处理多个视频文件，提高工作效率",
          backgroundColor: "#fcffe6",
        },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Layout className={styles.container}>
      <Content className={styles.content}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Title level={2} className={styles.pageTitle}>
            视频工具集
          </Title>
          <Paragraph className={styles.pageDescription}>
            专业的在线视频处理工具，让视频编辑变得简单高效
          </Paragraph>

          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className={styles.categorySection}>
              <Title level={3} className={styles.categoryTitle}>
                {category.title}
              </Title>
              <Row gutter={[24, 24]}>
                {category.tools.map((tool, toolIndex) => (
                  <Col xs={24} sm={12} md={8} lg={8} key={toolIndex}>
                    <motion.div variants={itemVariants}>
                      <Card
                        hoverable
                        className={styles.toolCard}
                        style={{ backgroundColor: tool.backgroundColor }}
                      >
                        <div className={styles.toolIcon}>
                          {React.cloneElement(tool.icon as React.ReactElement, {
                            style: { fontSize: "24px" },
                          })}
                        </div>
                        <div className={styles.toolContent}>
                          <Title level={4}>{tool.name}</Title>
                          <Paragraph>{tool.description}</Paragraph>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </motion.div>
      </Content>
    </Layout>
  );
};

export default VideoTools;
