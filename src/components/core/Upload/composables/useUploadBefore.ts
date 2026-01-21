import { ElNotification } from "element-plus";
import type { UploadProps } from "element-plus";

interface UseUploadBeforeOptions {
  fileSize: number;
  fileType: string[];
}

export function useUploadBefore(options: UseUploadBeforeOptions) {
  const beforeUpload: UploadProps["beforeUpload"] = rawFile => {
    const sizeOk = rawFile.size / 1024 / 1024 < options.fileSize;
    const typeOk = options.fileType.includes(rawFile.type);

    if (!typeOk) {
      ElNotification({
        title: "温馨提示",
        message: "上传文件不符合所需的格式！",
        type: "warning"
      });
    }

    if (!sizeOk) {
      setTimeout(() => {
        ElNotification({
          title: "温馨提示",
          message: `上传文件大小不能超过 ${options.fileSize}M！`,
          type: "warning"
        });
      }, 0);
    }

    return typeOk && sizeOk;
  };

  return beforeUpload;
}
