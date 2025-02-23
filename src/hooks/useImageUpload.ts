import { useState } from "react";
import { message } from "antd";
import { UploadChangeParam, UploadFile } from "antd/es/upload";

interface ImageInfo {
  file: File;
  preview: string;
  format?: string;
}

interface UseImageUploadOptions {
  onSuccess?: (imageInfo: ImageInfo) => void;
  validateFormat?: boolean;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);

  const handleUpload = async (info: UploadChangeParam<UploadFile>) => {
    // 只处理 done 状态的上传
    if (info.file.status !== "done") {
      return;
    }

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

      let format = "";
      if (options.validateFormat) {
        format = file.type.split("/")[1].toUpperCase();
        if (format === "JPEG") format = "JPG";
      }

      const newImageInfo: ImageInfo = {
        file,
        preview,
        ...(options.validateFormat ? { format } : {}),
      };

      setImageInfo(newImageInfo);
      options.onSuccess?.(newImageInfo);

      message.success(`${file.name} 上传成功`);
    } catch (error) {
      message.error("文件处理失败");
      console.error("文件处理错误:", error);
    }
  };

  const resetImage = () => {
    if (imageInfo?.preview) {
      URL.revokeObjectURL(imageInfo.preview);
    }
    setImageInfo(null);
  };

  return {
    imageInfo,
    setImageInfo,
    handleUpload,
    resetImage,
  };
};
