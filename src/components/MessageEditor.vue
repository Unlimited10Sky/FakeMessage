<template>
  <div class="message-editor">
    <div class="editor-header">
      <div class="sender-type">
        <label>
          <input
            type="radio"
            v-model="messageData.isSender"
            :value="true"
            name="senderType"
          />
          发送者
        </label>
        <label>
          <input
            type="radio"
            v-model="messageData.isSender"
            :value="false"
            name="senderType"
          />
          接收者
        </label>
      </div>
      <input
        type="datetime-local"
        v-model="messageData.timestamp"
        class="time-input"
      />
    </div>

    <div class="editor-content">
      <textarea
        v-model="messageData.text"
        placeholder="输入消息内容..."
        class="message-input"
      ></textarea>
      
      <div class="editor-tools">
        <button @click="openEmojiPicker" class="tool-button">
          😊
        </button>
        <button @click="openImageUploader" class="tool-button">
          🖼️
        </button>
      </div>
    </div>

    <div v-if="messageData.image" class="image-preview">
      <img :src="messageData.image" alt="预览图片" />
      <button @click="removeImage" class="remove-button">×</button>
    </div>

    <div class="editor-footer">
      <button @click="saveMessage" class="save-button">保存消息</button>
      <button @click="cancelEdit" class="cancel-button">取消</button>
    </div>

    <!-- 表情选择器弹窗 -->
    <div v-if="showEmojiPicker" class="emoji-picker-modal">
      <EmojiPicker @select="selectEmoji" @close="closeEmojiPicker" />
    </div>

    <!-- 图片上传弹窗 -->
    <div v-if="showImageUploader" class="image-uploader-modal">
      <ImageUploader @upload="handleImageUpload" @close="closeImageUploader" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import EmojiPicker from './EmojiPicker.vue'
import ImageUploader from './ImageUploader.vue'

const props = defineProps({
  initialMessage: {
    type: Object,
    default: () => ({
      text: '',
      image: '',
      emoji: '',
      timestamp: new Date().toISOString().slice(0, 16),
      isSender: true
    })
  }
})

const emit = defineEmits(['save', 'cancel'])

const messageData = reactive({...props.initialMessage})
const showEmojiPicker = ref(false)
const showImageUploader = ref(false)

// 表情相关方法
const openEmojiPicker = () => {
  showEmojiPicker.value = true
}

const closeEmojiPicker = () => {
  showEmojiPicker.value = false
}

const selectEmoji = (emoji) => {
  messageData.text += emoji
  closeEmojiPicker()
}

// 图片相关方法
const openImageUploader = () => {
  showImageUploader.value = true
}

const closeImageUploader = () => {
  showImageUploader.value = false
}

const handleImageUpload = (imageUrl) => {
  messageData.image = imageUrl
  closeImageUploader()
}

const removeImage = () => {
  messageData.image = ''
}

// 保存和取消
const saveMessage = () => {
  if (!messageData.text && !messageData.image && !messageData.emoji) {
    alert('请输入消息内容')
    return
  }
  emit('save', {...messageData})
}

const cancelEdit = () => {
  emit('cancel')
}
</script>

<style scoped>
.message-editor {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sender-type {
  display: flex;
  gap: 16px;
}

.time-input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-content {
  position: relative;
  margin-bottom: 12px;
}

.message-input {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.editor-tools {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.tool-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.image-preview {
  position: relative;
  margin: 12px 0;
}

.image-preview img {
  max-width: 200px;
  border-radius: 4px;
}

.remove-button {
  position: absolute;
  top: -8px;
  right: -8px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.save-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button {
  background: #007AFF;
  color: white;
}

.cancel-button {
  background: #E9E9EB;
  color: #333;
}

.emoji-picker-modal,
.image-uploader-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style> 