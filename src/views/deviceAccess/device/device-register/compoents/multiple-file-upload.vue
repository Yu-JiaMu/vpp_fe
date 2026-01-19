<template>
  <div class="multiple-file-upload">
    <div class="tip">
      <div class="flex flex-cz-center">
        <el-icon color="#298AF9" size="22"><Warning /></el-icon>
        <span class="ml10">
          导入系统已存在的设备数据，不会更改已存在设备的所属产品信息。请注意:您选择了多个产品，模板中将以sheet方式区分。
        </span>
      </div>
      <div class="ml30 mt5 font-primary-color">
        系统识别到您选择的多个产品间存在网关设备与子设备节点拓扑关系，如需绑定子设备管理关系，请在模板中录入。
      </div>
    </div>
    <div class="file-upload-box">
      <div class="title-box flex items-center gap-2">
        <img src="@/assets/images/deviceAccess/6.png" class="img6" />
        <span class="title-font">文件上传</span>
      </div>
      <el-upload
        class="file-upload-content mt-[20px]"
        drag
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <!-- <img src="@/assets/images/deviceAccess/7.png" alt="" /> -->
        <div class="upload-text mt10">
          <div>将文件拖到此处，或<em class="font-primary-color">点击上传</em></div>
          <div>（格式：xlsx）</div>
        </div>
      </el-upload>
    </div>
    <div class="file-upload-box">
      <div class="title-box flex items-center gap-2">
        <img src="@/assets/images/deviceAccess/7.png" class="img6" />
        <span class="title-font">下载模板</span>
      </div>
      <div class="gs-box">
        <div class="gs-content-item flex flex-cz-center flex-sp-center cursor-pointer">
          <img src="@/assets/images/deviceAccess/8.png" alt="" style="width: 35px; height: 35px" />
          <span>模版格式 . xlsx</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
  .multiple-file-upload {
    .font-primary-color {
      color: #298af9;
    }
    .tip {
      padding: 10px 12px;
      border-radius: 20px;
      background: #f7f8fa;
      font-size: 15px;
      color: #303537;
      font-weight: 400;
      max-width: 888px;
      .t-c {
        font-size: 15px;
        font-weight: 500;
        color: #303537;
      }
    }
    .file-upload-box {
      margin-top: 41px;
      .title-box {
        .img6 {
          width: 20px;
          height: 20px;
        }
        .title-font {
          font-size: 16px;
          font-family:
            Source Han Sans SC,
            Source Han Sans SC-Bold;
          font-weight: 700;
          color: #131617;
        }
      }
      .file-upload-content {
        padding-left: 30px;
        .upload-text {
          font-size: 14px;
          font-family:
            Source Han Sans SC,
            Source Han Sans SC-Regular;
          font-weight: 400;
          color: #303537;
        }
      }
    }
    .gs-box {
      margin-top: 20px;
      .gs-content-item {
        width: 327px;
        height: 35px;
        box-sizing: border-box;
        background: #f7f8fa;
        // border: 1px solid #5b77ff;
        border-radius: 6px;
      }
    }
  }
</style>
