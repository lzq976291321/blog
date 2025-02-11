import React from "react";
import { Layout, Typography } from "antd";
import { motion } from "framer-motion";
import ProjectList from "@/components/ProjectList";

import styles from "./Home.module.less";

const { Content, Footer } = Layout;
const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <Layout className={styles.container}>
      <motion.div
        className={styles.titleContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className={styles.titleWrapper}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.21, 0.45, 0.32, 0.9],
          }}
        >
          <Title className={styles.mainTitle}>
            <span className={styles.gradient}>Ryan's</span> AI Lab
          </Title>
          <motion.div
            className={styles.badgeContainer}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className={styles.badge}>项目展示</div>
          </motion.div>
        </motion.div>
      </motion.div>
      <Content className={styles.content}>
        <ProjectList />
      </Content>
      <Footer className={styles.footer}>© 2025 Ryan's</Footer>
    </Layout>
  );
};

export default Home;
