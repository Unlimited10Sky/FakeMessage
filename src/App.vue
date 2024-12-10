<template>
  <div class="iphone-container" ref="iphoneContainer">
    <!-- iOS 状态栏 -->
    <div class="ios-status-bar">
      <div class="time">10:04 AM</div>
      <div class="status-icons">
        <span class="signal">•••</span>
        <span class="network">5G</span>
        <span class="battery">▢</span>
      </div>
    </div>

    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left">
        <button class="back-button">
          <span class="back-arrow">‹</span>
          <span class="contact-number">1466</span>
          <span class="edit-icon">✎</span>
        </button>
      </div>
      <div class="contact-info">
        <div class="avatar" @click="openAvatarUploader">
          <img :src="senderAvatar" alt="avatar" />
        </div>
        <div class="contact-name">
          {{ sender || 'John Doe' }}
        </div>
      </div>
      <div class="header-right">
        <button class="export-button" @click="showExportControls = true">
          <span class="export-icon">⤓</span>
        </button>
      </div>
    </div>

    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="user-info">
        <input v-model="sender" placeholder="发件人名称" />
        <input v-model="receiver" placeholder="收件人名称" />
      </div>
    </div>

    <!-- 消息显示区域 -->
    <div class="message-container" ref="messageContainer">
      <!-- 添加 SMS 标题 -->
      <div class="message-title">
        <div class="title-text">SMS</div>
        <div class="title-time">24 Jul 11:49 PM</div>
      </div>

      <MessageList
        v-model:messages="messages"
        :sender-avatar="senderAvatar"
        :receiver-avatar="receiverAvatar"
        @edit="editMessage"
        @delete="deleteMessage"
        @preview-image="previewImage"
      />
    </div>

    <!-- 底部输入框 -->
    <div class="message-input-container">
      <button class="add-button">+</button>
      <div class="input-wrapper">
        <input type="text" placeholder="SMS" />
        <button class="voice-button">🎤</button>
      </div>
    </div>

    <!-- 底部横条 -->
    <div class="bottom-bar"></div>

    <!-- 底部编辑区域 -->
    <div class="editor-container">
      <MessageEditor
        v-if="editingMessage"
        :initial-message="editingMessage"
        @save="saveMessage"
        @cancel="cancelEdit"
      />
      <div v-else class="message-controls">
        <button @click="addNewMessage">新增消息</button>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <div v-if="showExportControls" class="modal">
      <ExportControls
        @export="handleExport"
        @close="showExportControls = false"
      />
    </div>

    <div v-if="showImagePreview" class="modal" @click="showImagePreview = false">
      <img :src="previewImageUrl" class="preview-image" />
    </div>

    <!-- 添加头像上传窗 -->
    <div v-if="showAvatarUploader" class="modal" @click.self="showAvatarUploader = false">
      <div class="avatar-uploader">
        <div class="avatar-header">
          <h3>更换头像</h3>
          <button class="close-button" @click="showAvatarUploader = false">×</button>
        </div>
        <input
          type="file"
          ref="avatarInput"
          accept="image/*"
          style="display: none"
          @change="handleAvatarChange"
        />
        <div class="avatar-preview">
          <img :src="tempAvatar || senderAvatar" alt="avatar preview" />
        </div>
        <div class="avatar-actions">
          <button @click="triggerAvatarUpload" class="upload-btn">选择图片</button>
          <button 
            v-if="tempAvatar" 
            @click="confirmAvatarChange" 
            class="confirm-btn"
          >
            确认
          </button>
          <button 
            v-if="senderAvatar !== defaultAvatar" 
            @click="resetAvatar" 
            class="reset-btn"
          >
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 添加一个专门用于导出的容器 -->
    <div class="export-container" ref="exportContainer" v-show="isExporting">
      <div class="ios-status-bar">
        <!-- 复制状态栏内容 -->
        <div class="time">10:04 AM</div>
        <div class="status-icons">
          <span class="signal">•••</span>
          <span class="network">5G</span>
          <span class="battery">▢</span>
        </div>
      </div>
      <div class="chat-header">
        <!-- 复制聊天头部内容 -->
        <div class="header-left">
          <button class="back-button">
            <span class="back-arrow">‹</span>
            <span class="contact-number">1466</span>
            <span class="edit-icon">✎</span>
          </button>
        </div>
        <div class="contact-info">
          <div class="avatar">
            <img :src="senderAvatar" alt="avatar" />
          </div>
          <div class="contact-name">
            {{ sender || 'John Doe' }}
            <span class="edit-icon">✎</span>
            <span class="chevron">›</span>
          </div>
        </div>
      </div>
      <!-- 复制消息内容 -->
      <div class="message-container">
        <MessageList
          v-model:messages="messages"
          :sender-avatar="senderAvatar"
          :receiver-avatar="receiverAvatar"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import MessageList from './components/MessageList.vue'
import MessageEditor from './components/MessageEditor.vue'
import ExportControls from './components/ExportControls.vue'
import draggable from 'vuedraggable'

// 基础状态
const sender = ref('')
const receiver = ref('')
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%238E8E93'/%3E%3Ctext x='50' y='50' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E✎%3C/text%3E%3C/svg%3E"
const senderAvatar = ref(defaultAvatar)
const receiverAvatar = ref(defaultAvatar)
const messageContainer = ref(null)
const messages = ref([])
const editingMessage = ref(null)
const showExportControls = ref(false)
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const showAvatarUploader = ref(false)
const avatarInput = ref(null)
const tempAvatar = ref(null)
const iphoneContainer = ref(null)
const exportContainer = ref(null)
const isExporting = ref(false)

// 在组件挂载时加载保存的头像
onMounted(() => {
  const savedSenderAvatar = localStorage.getItem('senderAvatar')
  const savedReceiverAvatar = localStorage.getItem('receiverAvatar')
  if (savedSenderAvatar) {
    senderAvatar.value = savedSenderAvatar
  }
  if (savedReceiverAvatar) {
    receiverAvatar.value = savedReceiverAvatar
  }
})

// 消息相关方法
const addNewMessage = () => {
  editingMessage.value = {
    id: Date.now(),
    text: '',
    image: '',
    emoji: '',
    timestamp: new Date().toISOString(),
    isSender: true
  }
}

const saveMessage = (message) => {
  const index = messages.value.findIndex(m => m.id === message.id)
  if (index > -1) {
    messages.value[index] = message
  } else {
    messages.value.push(message)
  }
  editingMessage.value = null
}

const cancelEdit = () => {
  editingMessage.value = null
}

// 图片预览
const previewImage = (imageUrl) => {
  previewImageUrl.value = imageUrl
  showImagePreview.value = true
}

// 导出相关方法
const handleExport = async (options) => {
  try {
    isExporting.value = true
    await nextTick()

    const container = exportContainer.value
    if (!container) return

    // 确保导出容器可见
    container.classList.add('exporting')
    
    // 等待所有图片完全加载
    const images = container.getElementsByTagName('img')
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve, reject) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = resolve
          img.onerror = reject
          // 重新加载图片以确保触发 onload
          const currentSrc = img.src
          img.src = ''
          img.src = currentSrc
        }
      })
    }))

    // 给图片加载一点额外��间
    await new Promise(resolve => setTimeout(resolve, 100))

    const exportOptions = {
      scale: window.devicePixelRatio * 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f2f2f7',
      width: container.offsetWidth,
      height: container.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      logging: true,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.querySelector('.export-container')
        if (clonedContainer) {
          clonedContainer.style.position = 'static'
          clonedContainer.style.visibility = 'visible'
          clonedContainer.style.transform = 'none'
          clonedContainer.style.width = `${container.offsetWidth}px`
          clonedContainer.style.height = `${container.offsetHeight}px`
        }
      }
    }

    const canvas = await html2canvas(container, exportOptions)

    if (options.format === 'png') {
      const image = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.download = `ios-messages-${Date.now()}.png`
      link.href = image
      link.click()
    } else {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
        hotfixes: ['px_scaling']
      })
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        canvas.width,
        canvas.height
      )
      
      pdf.save(`ios-messages-${Date.now()}.pdf`)
    }
  } catch (error) {
    console.error('Export failed:', error)
    alert('导出失败，请重试')
  } finally {
    // 移除导出状态
    const container = exportContainer.value
    if (container) {
      container.classList.remove('exporting')
    }
    isExporting.value = false
    showExportControls.value = false
  }
}

const openAvatarUploader = () => {
  showAvatarUploader.value = true
}

const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      tempAvatar.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const confirmAvatarChange = () => {
  senderAvatar.value = tempAvatar.value
  // 保存到 localStorage
  localStorage.setItem('senderAvatar', tempAvatar.value)
  tempAvatar.value = null
  showAvatarUploader.value = false
}

// 添加重置头像的方法
const resetAvatar = () => {
  senderAvatar.value = defaultAvatar
  localStorage.removeItem('senderAvatar')
  showAvatarUploader.value = false
}

// 编辑消息
const editMessage = (message) => {
  editingMessage.value = { ...message }
}

// 删除消息
const deleteMessage = (message) => {
  const index = messages.value.findIndex(m => m.id === message.id)
  if (index > -1) {
    messages.value.splice(index, 1)
  }
}
</script>

<style scoped>
.ios-status-bar {
  background: #f2f2f7;
  padding: 2px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
}

.time {
  flex: 1;
  text-align: center;
  font-weight: 600;
}

.status-icons {
  display: flex;
  gap: 4px;
  align-items: center;
}

.signal {
  letter-spacing: -1px;
}

.chat-header {
  background: #f2f2f7;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.back-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #007AFF;
  font-size: 16px;
  padding: 0;
  cursor: pointer;
  gap: 2px;
}

.back-arrow {
  font-size: 32px;
  line-height: 1;
  margin-right: -2px;
}

.contact-number {
  font-weight: 400;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-right: 40px;
  position: relative;
  left: -20px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #8E8E93;
  overflow: hidden;
  cursor: pointer;
}

.contact-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-top: 2px;
}

.edit-icon,
.chevron {
  display: none;
}

.header-right {
  position: absolute;
  right: 15px;
  display: flex;
  align-items: center;
}

.export-button {
  background: none;
  border: none;
  color: #007AFF;
  font-size: 18px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.export-button:hover {
  opacity: 1;
}

.export-button:active {
  opacity: 0.7;
}

.export-icon {
  transform: translateY(-1px);
}

/* 移除不需要的控制栏 */
.control-bar {
  display: none;
}

/* 调整消息容器样式 */
.message-container {
  background: #ffffff;
  flex: 1;
  overflow-y: auto;
  padding: 0;  /* 移除内边距 */
}

.avatar-uploader {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  margin: 20px auto;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.upload-btn,
.confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.upload-btn {
  background: #007AFF;
  color: white;
}

.confirm-btn {
  background: #34C759;
  color: white;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .avatar-uploader {
    background: #1c1c1e;
    color: white;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
}

.avatar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #8e8e93;
  cursor: pointer;
}

.reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #ff3b30;
  color: white;
}

/* 优化按钮悬停效果 */
.upload-btn:hover,
.confirm-btn:hover,
.reset-btn:hover {
  opacity: 0.9;
}

.upload-btn:active,
.confirm-btn:active,
.reset-btn:active {
  opacity: 0.7;
}

.message-title {
  text-align: center;
  padding: 10px 0;
  color: #8E8E93;
  font-size: 12px;
}

.title-text {
  font-weight: 500;
  margin-bottom: 4px;
}

.title-time {
  font-weight: 400;
}

.message-input-container {
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f2f2f7;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.add-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e5e5ea;
  border: none;
  color: #8e8e93;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 4px 12px;
  gap: 8px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 6px 0;
}

.voice-button {
  background: none;
  border: none;
  font-size: 18px;
  color: #8e8e93;
  cursor: pointer;
  padding: 0;
}

.bottom-bar {
  width: 40%;
  height: 4px;
  background: #000;
  border-radius: 2px;
  margin: 4px auto;
  opacity: 0.3;
}

/* 确保导出时容器有正确的背景色 */
.iphone-container {
  background: #f2f2f7;
  position: relative;
  overflow: hidden;
}

.export-container {
  position: fixed;
  left: -9999px;
  background: #f2f2f7;
  width: 414px;
  z-index: -1;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s;
}

.export-container.exporting {
  visibility: visible;
  opacity: 1;
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
}

.export-container img {
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}
</style> 