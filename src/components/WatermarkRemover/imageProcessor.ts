/**
 * 图像处理工具类
 */
export class ImageProcessor {
  // 调整初始参数
  private static searchRangeRatio = 0.2;
  private static minSearchRatio = 0.15;
  private static maxSearchRatio = 0.4;
  private static adjustStep = 0.05;

  /**
   * 调整搜索范围
   */
  private static adjustSearchRange(success: boolean, watermarkSize: number) {
    if (!success) {
      // 如果没检测到水印，增加搜索范围，但增加得更快一些
      this.searchRangeRatio = Math.min(
        this.searchRangeRatio + this.adjustStep * 1.5,
        this.maxSearchRatio
      );
    } else {
      // 如果检测到水印，根据水印大小微调搜索范围
      const targetRatio = watermarkSize * 1.2; // 比水印大小多20%
      if (Math.abs(this.searchRangeRatio - targetRatio) > 0.02) {
        this.searchRangeRatio = targetRatio;
      }
    }

    // 确保在合理范围内
    this.searchRangeRatio = Math.max(
      Math.min(this.searchRangeRatio, this.maxSearchRatio),
      this.minSearchRatio
    );
  }

  /**
   * 获取图像数据
   * @param image HTML图像元素
   * @returns ImageData对象
   */
  static getImageData(image: HTMLImageElement): ImageData {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(image, 0, 0);
    return ctx?.getImageData(0, 0, canvas.width, canvas.height) as ImageData;
  }

  /**
   * 创建新的 ImageData
   * @param width 宽度
   * @param height 高度
   * @returns ImageData对象
   */
  static createImageData(width: number, height: number): ImageData {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    return ctx?.createImageData(width, height) as ImageData;
  }

  /**
   * 计算像素亮度
   * @param r 红色通道值
   * @param g 绿色通道值
   * @param b 蓝色通道值
   * @returns 亮度值 (0-1)
   */
  static calculateLuminance(r: number, g: number, b: number): number {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /**
   * 获取邻域像素平均值
   * @param imageData 图像数据
   * @param x 中心点x坐标
   * @param y 中心点y坐标
   * @param radius 邻域半径
   * @returns RGB平均值数组
   */
  static getNeighborhoodAverage(
    imageData: ImageData,
    x: number,
    y: number,
    radius: number
  ): [number, number, number] {
    let rSum = 0,
      gSum = 0,
      bSum = 0;
    let count = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (
          nx >= 0 &&
          nx < imageData.width &&
          ny >= 0 &&
          ny < imageData.height
        ) {
          const idx = (ny * imageData.width + nx) * 4;
          rSum += imageData.data[idx];
          gSum += imageData.data[idx + 1];
          bSum += imageData.data[idx + 2];
          count++;
        }
      }
    }

    return [
      Math.round(rSum / count),
      Math.round(gSum / count),
      Math.round(bSum / count),
    ];
  }

  /**
   * 检测水印区域
   */
  static detectWatermarkRegion(
    imageData: ImageData
  ): [number, number, number, number] {
    const { width, height } = imageData;

    // 扩展搜索区域略大一些
    const searchArea = {
      x: Math.floor(width * (1 - this.searchRangeRatio) - 10), // 额外延伸10像素
      y: Math.floor(height * (1 - this.searchRangeRatio) - 10),
      width: Math.floor(width * this.searchRangeRatio + 20), // 两边各延伸10像素
      height: Math.floor(height * this.searchRangeRatio + 20),
    };

    // 确保搜索区域不超出图片范围
    searchArea.x = Math.max(0, searchArea.x);
    searchArea.y = Math.max(0, searchArea.y);
    searchArea.width = Math.min(searchArea.width, width - searchArea.x);
    searchArea.height = Math.min(searchArea.height, height - searchArea.y);

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasWatermark = false;

    // 计算搜索区域的亮度统计
    let totalLuminance = 0;
    let pixelCount = 0;

    // 第一遍：计算统计值
    for (let y = searchArea.y; y < searchArea.y + searchArea.height; y++) {
      for (let x = searchArea.x; x < searchArea.x + searchArea.width; x++) {
        const i = (y * width + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        totalLuminance += this.calculateLuminance(r, g, b);
        pixelCount++;
      }
    }

    const avgLuminance = totalLuminance / pixelCount;
    const luminanceThreshold = avgLuminance + 0.12; // 稍微降低亮度阈值

    // 第二遍：更精确的水印检测
    for (let y = searchArea.y; y < searchArea.y + searchArea.height; y++) {
      for (let x = searchArea.x; x < searchArea.x + searchArea.width; x++) {
        const i = (y * width + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const luminance = this.calculateLuminance(r, g, b);
        const isHighLuminance = luminance > luminanceThreshold;
        const isNearWhite = r > 140 && g > 140 && b > 140; // 降低白色阈值
        const colorVariance = Math.max(
          Math.abs(r - g),
          Math.abs(g - b),
          Math.abs(b - r)
        );
        const isGrayish = colorVariance < 60; // 放宽灰度色差限制

        if (
          (isHighLuminance && isNearWhite) ||
          (isHighLuminance && isGrayish)
        ) {
          hasWatermark = true;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (!hasWatermark) {
      this.adjustSearchRange(false, 0);
      return [0, 0, 0, 0];
    }

    // 计算水印区域大小比例
    const watermarkSizeRatio = Math.max(
      (maxX - minX) / width,
      (maxY - minY) / height
    );

    // 调整搜索范围
    this.adjustSearchRange(true, watermarkSizeRatio);

    // 增加padding以确保完全覆盖
    const padding = 8;
    return [
      Math.max(0, minX - padding),
      Math.max(0, minY - padding),
      Math.min(width - minX, maxX - minX + padding * 2),
      Math.min(height - minY, maxY - minY + padding * 2),
    ];
  }

  /**
   * 重置搜索范围到默认值
   */
  static resetSearchRange() {
    this.searchRangeRatio = 0.2;
  }

  /**
   * 智能修复区域
   * @param imageData 原始图像数据
   * @param region 需要修复的区域 [x, y, width, height]
   * @returns 修复后的图像数据
   */
  static inpaintRegion(
    imageData: ImageData,
    region: [number, number, number, number]
  ): ImageData {
    const result = this.createImageData(imageData.width, imageData.height);
    const { data } = result;
    data.set(imageData.data);

    const [rx, ry, rwidth, rheight] = region;
    const { width, height } = imageData;

    // 增加采样参数
    const samplingRadius = 30; // 增大采样半径
    const maxSamples = 100; // 限制最大样本数
    const patchSize = 3; // 块匹配大小

    // 处理需要修复的区域
    for (let y = ry; y < ry + rheight; y++) {
      for (let x = rx; x < rx + rwidth; x++) {
        const i = (y * width + x) * 4;

        // 收集周围区域的纹理样本
        const samples: Array<{
          color: [number, number, number];
          distance: number;
          textureScore: number;
        }> = [];

        // 在区域外采样
        for (
          let sy = Math.max(0, y - samplingRadius);
          sy < Math.min(height, y + samplingRadius);
          sy++
        ) {
          for (
            let sx = Math.max(0, x - samplingRadius);
            sx < Math.min(width, x + samplingRadius);
            sx++
          ) {
            // 跳过水印区域内的点
            if (sx >= rx && sx < rx + rwidth && sy >= ry && sy < ry + rheight) {
              continue;
            }

            // 计算纹理匹配分数
            let textureScore = 0;
            let validPatches = 0;

            // 比较周围的像素块
            for (let dy = -patchSize; dy <= patchSize; dy++) {
              for (let dx = -patchSize; dx <= patchSize; dx++) {
                const px = x + dx;
                const py = y + dy;
                const psx = sx + dx;
                const psy = sy + dy;

                if (
                  px >= 0 &&
                  px < width &&
                  py >= 0 &&
                  py < height &&
                  psx >= 0 &&
                  psx < width &&
                  psy >= 0 &&
                  psy < height &&
                  !(
                    px >= rx &&
                    px < rx + rwidth &&
                    py >= ry &&
                    py < ry + rheight
                  )
                ) {
                  const pi = (py * width + px) * 4;
                  const psi = (psy * width + psx) * 4;

                  // 计算颜色差异
                  const colorDiff =
                    Math.abs(imageData.data[pi] - imageData.data[psi]) +
                    Math.abs(imageData.data[pi + 1] - imageData.data[psi + 1]) +
                    Math.abs(imageData.data[pi + 2] - imageData.data[psi + 2]);

                  textureScore += 1 / (1 + colorDiff * 0.1);
                  validPatches++;
                }
              }
            }

            if (validPatches > 0) {
              textureScore /= validPatches;
              const si = (sy * width + sx) * 4;
              const distance = Math.sqrt(
                (x - sx) * (x - sx) + (y - sy) * (y - sy)
              );

              samples.push({
                color: [
                  imageData.data[si],
                  imageData.data[si + 1],
                  imageData.data[si + 2],
                ],
                distance,
                textureScore,
              });

              // 限制样本数量
              if (samples.length >= maxSamples) {
                break;
              }
            }
          }
          if (samples.length >= maxSamples) {
            break;
          }
        }

        if (samples.length > 0) {
          // 根据距离和纹理相似度排序样本
          samples.sort((a, b) => {
            const scoreA = a.textureScore / (1 + a.distance * 0.05);
            const scoreB = b.textureScore / (1 + b.distance * 0.05);
            return scoreB - scoreA;
          });

          // 使用最佳样本的颜色
          const bestSamples = samples.slice(0, 5); // 取前5个最佳样本
          let totalWeight = 0;
          let weightedR = 0;
          let weightedG = 0;
          let weightedB = 0;

          bestSamples.forEach(({ color, distance, textureScore }) => {
            const weight = textureScore / (1 + distance * 0.05);
            totalWeight += weight;
            weightedR += color[0] * weight;
            weightedG += color[1] * weight;
            weightedB += color[2] * weight;
          });

          data[i] = Math.round(weightedR / totalWeight);
          data[i + 1] = Math.round(weightedG / totalWeight);
          data[i + 2] = Math.round(weightedB / totalWeight);
          data[i + 3] = imageData.data[i + 3];
        }
      }
    }

    // 增强边缘平滑
    this.enhancedSmoothEdges(data, region, width, height);

    return result;
  }

  /**
   * 增强的边缘平滑处理
   */
  private static enhancedSmoothEdges(
    data: Uint8ClampedArray,
    region: [number, number, number, number],
    width: number,
    height: number
  ) {
    const [rx, ry, rwidth, rheight] = region;
    const blendRadius = 5; // 增加平滑半径

    for (let y = ry - blendRadius; y < ry + rheight + blendRadius; y++) {
      for (let x = rx - blendRadius; x < rx + rwidth + blendRadius; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          if (x < rx || x >= rx + rwidth || y < ry || y >= ry + rheight) {
            const i = (y * width + x) * 4;
            const distance = Math.min(
              Math.abs(x - rx),
              Math.abs(x - (rx + rwidth)),
              Math.abs(y - ry),
              Math.abs(y - (ry + rheight))
            );

            if (distance < blendRadius) {
              // 使用平滑的过渡函数
              const blendFactor = Math.pow(distance / blendRadius, 2);
              const originalColor = [data[i], data[i + 1], data[i + 2]];

              const innerX = Math.max(rx, Math.min(rx + rwidth - 1, x));
              const innerY = Math.max(ry, Math.min(ry + rheight - 1, y));
              const innerI = (innerY * width + innerX) * 4;
              const innerColor = [
                data[innerI],
                data[innerI + 1],
                data[innerI + 2],
              ];

              data[i] = Math.round(
                originalColor[0] * blendFactor +
                  innerColor[0] * (1 - blendFactor)
              );
              data[i + 1] = Math.round(
                originalColor[1] * blendFactor +
                  innerColor[1] * (1 - blendFactor)
              );
              data[i + 2] = Math.round(
                originalColor[2] * blendFactor +
                  innerColor[2] * (1 - blendFactor)
              );
            }
          }
        }
      }
    }
  }

  /**
   * 用黑色遮盖水印区域
   */
  static coverWatermark(imageData: ImageData): ImageData {
    // 检测水印区域
    const [wx, wy, wwidth, wheight] = this.detectWatermarkRegion(imageData);

    if (wwidth === 0 || wheight === 0) {
      return imageData; // 如果没有检测到水印，返回原图
    }

    // 创建新的图像数据
    const result = this.createImageData(imageData.width, imageData.height);
    const { data } = result;

    // 复制原始图像数据
    data.set(imageData.data);

    // 用黑色遮盖水印区域
    for (let y = wy; y < wy + wheight; y++) {
      for (let x = wx; x < wx + wwidth; x++) {
        const i = (y * imageData.width + x) * 4;
        // 设置为黑色 (R=0, G=0, B=0)
        data[i] = 0; // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
        data[i + 3] = 255; // Alpha (不透明)
      }
    }

    return result;
  }
}
