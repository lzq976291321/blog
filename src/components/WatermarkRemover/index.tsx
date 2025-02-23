import React, { useState } from "react";
import { Upload, Button, Progress, message } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageProcessor } from "./imageProcessor";
import styles from "./WatermarkRemover.module.less";

const { Dragger } = Upload;

const WatermarkRemover: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>("");

  const { imageInfo, handleUpload } = useImageUpload();

  /**
   * 加载图片
   * @param src 图片URL
   * @returns Promise<HTMLImageElement>
   */
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  /**
   * 处理水印
   */
  const removeWatermark = async () => {
    if (!imageInfo) {
      message.error("请先上传图片");
      return;
    }

    // 重置搜索范围
    ImageProcessor.resetSearchRange();
    setProcessing(true);
    setProgress(0);

    try {
      // 加载图片
      const img = await loadImage(imageInfo.preview);
      setProgress(30);

      // 获取图像数据
      const imageData = ImageProcessor.getImageData(img);
      setProgress(60);

      // 遮盖水印
      const processedData = ImageProcessor.coverWatermark(imageData);
      setProgress(90);

      // 转换为URL
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.putImageData(processedData, 0, 0);

      const resultUrl = canvas.toDataURL("image/png");
      setResultUrl(resultUrl);

      setProgress(100);
      message.success("水印区域已标记！");
    } catch (error) {
      console.error("处理失败:", error);
      message.error("处理失败，请重试");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      <div className={styles.remover}>
        <Dragger
          accept="image/*"
          showUploadList={false}
          customRequest={({ onSuccess }) => onSuccess?.("ok")}
          onChange={handleUpload}
          className={styles.uploader}
        >
          {!imageInfo ? (
            <div className={styles.uploadHint}>
              <p className={styles.uploadIcon}>
                <InboxOutlined />
              </p>
              <p className={styles.uploadText}>点击或拖拽图片到此区域</p>
              <p className={styles.uploadDesc}>支持 JPG、PNG、WEBP 格式</p>
            </div>
          ) : (
            <div className={styles.preview}>
              <img src={imageInfo.preview} alt="preview" />
            </div>
          )}
        </Dragger>

        {imageInfo && (
          <div className={styles.controls}>
            <Button
              type="primary"
              onClick={removeWatermark}
              disabled={processing}
              loading={processing}
              className={styles.processBtn}
            >
              {processing ? "处理中..." : "检测水印"}
            </Button>
          </div>
        )}

        {processing && (
          <div className={styles.progress}>
            <Progress percent={progress} status="active" />
          </div>
        )}

        {resultUrl && (
          <div className={styles.result}>
            <div className={styles.resultPreview}>
              <img src={resultUrl} alt="result" />
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {
                const link = document.createElement("a");
                link.href = resultUrl;
                link.download = "watermark_removed.png";
                link.click();
              }}
              className={styles.downloadBtn}
            >
              下载处理后的图片
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WatermarkRemover;
