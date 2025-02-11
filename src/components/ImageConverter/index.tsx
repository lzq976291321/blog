import React, { useEffect, useState } from "react";
import { Upload, Select, Button, Progress, message } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import imageCompression from "browser-image-compression";
import styles from "./ImageConverter.module.less";

const { Dragger } = Upload;

// 支持的图片格式
const supportedFormats = [
  { label: "JPG", value: "JPG" },
  { label: "PNG", value: "PNG" },
  { label: "WEBP", value: "WEBP" },
];

interface ImageInfo {
  file: File;
  preview: string;
  format: string;
}

const ImageConverter: React.FC = () => {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState<string>("");

  const handleUpload = async (info: any) => {
    // 获取最新上传的文件
    const file =
      info.file.originFileObj ||
      info.fileList[info.fileList.length - 1]?.originFileObj;

    if (!file) {
      message.error("文件上传失败");
      return;
    }

    try {
      // 验证文件类型
      const fileType = file.type.toLowerCase();
      if (!fileType.startsWith("image/")) {
        message.error("请上传图片文件");
        return;
      }

      // 创建预览URL
      const preview = URL.createObjectURL(file);

      // 获取并标准化格式名称
      let format = file.type.split("/")[1].toUpperCase();
      if (format === "JPEG") format = "JPG";

      // 更新状态
      setImageInfo({
        file,
        preview,
        format,
      });

      // 重置其他状态
      setTargetFormat("");
      setConvertedUrl("");
      setProgress(0);

      message.success(`${file.name} 上传成功`);
    } catch (error) {
      message.error("文件处理失败");
      console.error("文件处理错误:", error);
    }
  };

  const convertImage = async () => {
    if (!imageInfo || !targetFormat) return;

    setConverting(true);
    setProgress(0);

    try {
      // 创建 canvas 来处理图片
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("无法创建 canvas context");
      }

      // 加载图片
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageInfo.preview;
      });

      // 设置 canvas 尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制图片到 canvas
      ctx.drawImage(img, 0, 0);

      setProgress(30);

      // 根据目标格式进行转换
      let quality = 0.92;
      let mimeType: string;

      switch (targetFormat) {
        case "JPG":
        case "JPEG":
          mimeType = "image/jpeg";
          break;
        case "PNG":
          mimeType = "image/png";
          quality = 1; // PNG 使用无损压缩
          break;
        case "WEBP":
          mimeType = "image/webp";
          break;
        default:
          throw new Error("不支持的格式");
      }

      // 从 canvas 获取 blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("转换失败"));
            }
          },
          mimeType,
          quality
        );
      });

      setProgress(70);

      // 对于 JPG 和 WEBP 格式进行额外的压缩优化
      if (["JPG", "JPEG", "WEBP"].includes(targetFormat)) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: mimeType,
        };

        const compressedFile = await imageCompression(
          new File([blob], "converted", { type: mimeType }),
          options
        );

        setProgress(90);
        const convertedUrl = URL.createObjectURL(compressedFile);
        setConvertedUrl(convertedUrl);
      } else {
        const convertedUrl = URL.createObjectURL(blob);
        setConvertedUrl(convertedUrl);
      }

      setProgress(100);
      message.success("转换成功！");
    } catch (error) {
      console.error("转换失败:", error);
      message.error("转换失败");
    } finally {
      setConverting(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `converted.${targetFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    console.log(imageInfo, "imageInfo");
  }, [imageInfo]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      <div className={styles.converter}>
        <Dragger
          accept="image/*"
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleUpload}
          className={styles.uploader}
        >
          {!imageInfo ? (
            <div className={styles.uploadHint}>
              <p className={styles.uploadIcon}>
                <InboxOutlined />
              </p>
              <p className={styles.uploadText}>点击或拖拽图片到此区域</p>
              <p className={styles.uploadDesc}>支持 JPEG/JPG、PNG、WEBP 格式</p>
            </div>
          ) : (
            <div className={styles.preview}>
              <img src={imageInfo.preview} alt="preview" />
            </div>
          )}
        </Dragger>

        {imageInfo && (
          <div className={styles.controls}>
            <div className={styles.info}>
              <span>当前格式：{imageInfo.format}</span>
            </div>
            <Select
              placeholder="选择目标格式"
              value={targetFormat}
              onChange={setTargetFormat}
              className={styles.select}
              options={supportedFormats.filter(
                (format) => format.value !== imageInfo.format
              )}
            />
            <Button
              type="primary"
              onClick={convertImage}
              disabled={!targetFormat || converting}
              loading={converting}
              className={styles.convertBtn}
            >
              开始转换
            </Button>
          </div>
        )}

        {converting && (
          <div className={styles.progress}>
            <Progress percent={progress} status="active" />
          </div>
        )}

        {convertedUrl && (
          <div className={styles.result}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadImage}
              className={styles.downloadBtn}
            >
              下载转换后的图片
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImageConverter;
