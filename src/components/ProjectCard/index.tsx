import React from "react";
import { Card, Typography } from "antd";
import { PlayCircleOutlined, UserOutlined } from "@ant-design/icons";
import styles from "./ProjectCard.module.less";

const { Paragraph, Title } = Typography;

interface ProjectCardProps {
  title: string;
  description: string;
  link: string;
  icon: "video" | "profile";
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  link,
  icon,
}) => {
  const getIcon = () => {
    switch (icon) {
      case "video":
        return <PlayCircleOutlined className={styles.cardIcon} />;
      case "profile":
        return <UserOutlined className={styles.cardIcon} />;
      default:
        return null;
    }
  };

  return (
    <Card
      hoverable
      className={styles.projectCard}
      onClick={() => window.open(link, "_blank")}
    >
      <div className={styles.cardContent}>
        {getIcon()}
        <div className={styles.textContent}>
          <Title level={4}>{title}</Title>
          <Paragraph ellipsis={{ rows: 2 }}>{description}</Paragraph>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
