<template>
  <div class="emoji-picker">
    <div class="emoji-picker-header">
      <h3>选择表情</h3>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    
    <div class="emoji-categories">
      <button
        v-for="(category, index) in categories"
        :key="index"
        class="category-button"
        :class="{ active: currentCategory === index }"
        @click="currentCategory = index"
      >
        {{ category.icon }}
      </button>
    </div>

    <div class="emoji-list">
      <button
        v-for="emoji in currentEmojis"
        :key="emoji"
        class="emoji-button"
        @click="selectEmoji(emoji)"
      >
        {{ emoji }}
      </button>
    </div>

    <div class="recently-used" v-if="recentEmojis.length">
      <div class="section-title">最近使用</div>
      <div class="emoji-list">
        <button
          v-for="emoji in recentEmojis"
          :key="emoji"
          class="emoji-button"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 表情分类
const categories = [
  {
    icon: '😊',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰']
  },
  {
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
  },
  {
    icon: '👍',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆']
  },
  {
    icon: '🐱',
    emojis: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸']
  }
]

const currentCategory = ref(0)
const recentEmojis = ref([])

// 获取当前分类的表情
const currentEmojis = computed(() => {
  return categories[currentCategory.value].emojis
})

// 选择表情
const selectEmoji = (emoji) => {
  // 更新最近使用的表情
  if (!recentEmojis.value.includes(emoji)) {
    recentEmojis.value.unshift(emoji)
    if (recentEmojis.value.length > 8) {
      recentEmojis.value.pop()
    }
  }
  
  // 触发选择事件
  emit('select', emoji)
}

const emit = defineEmits(['select', 'close'])
</script>

<style scoped>
.emoji-picker {
  padding: 16px;
  max-height: 50vh;
  overflow-y: auto;
}

.emoji-picker-header {
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

.emoji-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.category-button {
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
}

.category-button.active {
  background: #f0f0f0;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.emoji-button {
  background: none;
  border: none;
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
}

.emoji-button:hover {
  background: #f0f0f0;
}

.recently-used {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* 适配暗色模式 */
@media (prefers-color-scheme: dark) {
  .emoji-picker {
    background: #1c1c1e;
    color: white;
  }

  .category-button.active {
    background: #2c2c2e;
  }

  .emoji-button:hover {
    background: #2c2c2e;
  }

  .section-title {
    color: #999;
  }
}
</style> 