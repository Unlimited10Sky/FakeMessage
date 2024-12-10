<template>
  <div class="image-uploader">
    <div class="uploader-header">
      <h3>上传图片</h3>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    
    <div class="upload-area" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="upload-hint">
        <span class="upload-icon">📁</span>
        <p>点击或拖拽图片到此处上传</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['upload', 'close'])
const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('upload', e.target.result)
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.image-uploader {
  padding: 16px;
}

.uploader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #007AFF;
}

.upload-hint {
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 8px;
  display: block;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .image-uploader {
    background: #1c1c1e;
    color: white;
  }

  .upload-area {
    border-color: #333;
  }

  .upload-area:hover {
    border-color: #007AFF;
  }

  .upload-hint {
    color: #999;
  }
}
</style> 