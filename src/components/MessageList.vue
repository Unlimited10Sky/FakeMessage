<template>
  <div class="message-list">
    <draggable
      v-model="localMessages"
      item-key="id"
      @end="handleDragEnd"
      handle=".message-drag-handle"
    >
      <template #item="{ element: message }">
        <div
          class="message-item"
          :class="{ 'message-sent': message.isSender, 'message-received': !message.isSender }"
        >
          <div class="message-content">
            <div class="message-actions">
              <button class="message-drag-handle">⋮⋮</button>
              <button class="message-edit" @click="editMessage(message)">✎</button>
              <button class="message-delete" @click="deleteMessage(message)">×</button>
            </div>
            <div class="message-bubble">
              <div v-if="message.text" class="message-text">{{ message.text }}</div>
              <img
                v-if="message.image"
                :src="message.image"
                class="message-image"
                @click="previewImage(message.image)"
              />
              <div v-if="message.emoji" class="message-emoji">{{ message.emoji }}</div>
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:messages', 'edit', 'delete', 'previewImage'])

// 本地消息列表，用于拖拽排序
const localMessages = ref([...props.messages])

// 监听外部消息变化
watch(() => props.messages, (newMessages) => {
  localMessages.value = [...newMessages]
}, { deep: true })

// 处理拖拽结束
const handleDragEnd = () => {
  emit('update:messages', localMessages.value)
}

// 编辑消息
const editMessage = (message) => {
  emit('edit', message)
}

// 删除消息
const deleteMessage = (message) => {
  if (confirm('确定要删除这条消息吗？')) {
    emit('delete', message)
  }
}

const previewImage = (imageUrl) => {
  emit('previewImage', imageUrl)
}
</script>

<style scoped>
.message-list {
  padding: 8px 16px;
}

.message-item {
  display: flex;
  margin-bottom: 2px;
  align-items: flex-end;
}

.message-sent {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 6px 12px 7px;
  border-radius: 17px;
  position: relative;
  font-size: 17px;
  line-height: 1.3334;
  min-height: 32px;
  display: flex;
  align-items: center;
}

/* 发送的消息 */
.message-sent .message-bubble {
  background-color: #30D158;
  color: white;
  margin-right: 0;
  border-top-right-radius: 3px;
  margin-left: auto;
}

/* 接收的消息 */
.message-received .message-bubble {
  background-color: #E9E9EB;
  color: rgb(0, 0, 0);
  margin-left: 0;
  border-top-left-radius: 3px;
}

.message-text {
  -webkit-font-smoothing: subpixel-antialiased;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

.message-image {
  max-width: 200px;
  border-radius: 14px;
  cursor: pointer;
}

.message-emoji {
  font-size: 24px;
  line-height: 1;
  padding: 0;
}

/* 特殊处理表情消息的气泡 */
.message-bubble:has(.message-emoji) {
  padding: 3px 8px;
  min-height: auto;
}

/* 过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 确保导出时的样式一致 */
@media print {
  .message-sent .message-bubble {
    background-color: #30D158 !important;
    color: white !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .message-received .message-bubble {
    background-color: #E9E9EB !important;
    color: rgb(0, 0, 0) !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

.message-actions {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-sent .message-actions {
  left: -40px;
  right: auto;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.message-drag-handle,
.message-edit,
.message-delete {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.message-drag-handle {
  cursor: move;
}

.message-delete {
  color: #ff3b30;
}

.message-content {
  position: relative;
}
</style> 