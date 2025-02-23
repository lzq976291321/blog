import React from "react";
import { Row, Col, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { FileImageOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import styles from "./ProjectList.module.less";

const ProjectList: React.FC = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: "图片格式转换",
      description: "支持 JPG、PNG、WEBP 格式互转",
      icon: <FileImageOutlined />,
      link: "/image-converter",
      iconBg: "#ecfdf3",
      iconColor: "#84cc16",
    },
    {
      title: "图片压缩",
      description: "图片压缩",
      icon: <FileImageOutlined />,
      link: "https://tinypng.com/",
      iconBg: "#f0f9ff",
      iconColor: "#0ea5e9",
    },
    {
      title: "检测水印",
      description: "智能检测图片水印",
      icon: <FileImageOutlined />,
      link: "/watermark-detect",
      iconBg: "#fdf2f8",
      iconColor: "#ec4899",
    },
  ];

  const handleClick = (link: string) => {
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
  };

  return (
    <Row gutter={[32, 32]} className={styles.projectList}>
      {projects.map((project, index) => (
        <Col xs={24} sm={24} md={12} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card
              className={styles.projectCard}
              onClick={() => handleClick(project.link)}
              bordered={false}
            >
              <div
                className={styles.iconWrapper}
                style={{
                  backgroundColor: project.iconBg,
                }}
              >
                <span style={{ color: project.iconColor }}>{project.icon}</span>
              </div>
              <div className={styles.contentWrapper}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDesc}>{project.description}</p>
              </div>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
};

export default ProjectList;
