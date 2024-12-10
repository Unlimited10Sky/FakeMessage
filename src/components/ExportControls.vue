<template>
  <div class="export-controls">
    <div class="export-header">
      <h3>导出设置</h3>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>

    <div class="export-options">
      <div class="option-group">
        <h4>导出格式</h4>
        <div class="format-options">
          <label>
            <input
              type="radio"
              v-model="exportFormat"
              value="png"
              name="format"
            />
            PNG图片
          </label>
          <label>
            <input
              type="radio"
              v-model="exportFormat"
              value="pdf"
              name="format"
            />
            PDF文档
          </label>
        </div>
      </div>

      <div class="option-group">
        <h4>图片质量</h4>
        <div class="quality-slider">
          <input
            type="range"
            v-model="quality"
            min="0.1"
            max="1"
            step="0.1"
          />
          <span>{{ Math.round(quality * 100) }}%</span>
        </div>
      </div>

      <div class="option-group">
        <h4>页面设置</h4>
        <div class="page-options">
          <label>
            <input
              type="checkbox"
              v-model="includeHeader"
            />
            包含页眉
          </label>
          <label>
            <input
              type="checkbox"
              v-model="includeTimestamp"
            />
            包含时间戳
          </label>
        </div>
      </div>
    </div>

    <div class="export-footer">
      <button
        class="export-button"
        @click="handleExport"
        :disabled="exporting"
      >
        {{ exporting ? '导出中...' : '开始导出' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['export', 'close'])

const exportFormat = ref('png')
const quality = ref(0.8)
const includeHeader = ref(true)
const includeTimestamp = ref(true)
const exporting = ref(false)

const handleExport = async () => {
  exporting.value = true
  try {
    await emit('export', {
      format: exportFormat.value,
      quality: quality.value,
      includeHeader: includeHeader.value,
      includeTimestamp: includeTimestamp.value
    })
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.export-controls {
  padding: 16px;
  background: white;
}

.export-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}

.option-group {
  margin-bottom: 20px;
}

.option-group h4 {
  margin-bottom: 8px;
  color: #666;
}

.format-options,
.page-options {
  display: flex;
  gap: 16px;
}

.quality-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quality-slider input {
  flex: 1;
}

.export-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.export-button {
  padding: 8px 24px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.export-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .export-controls {
    background: #1c1c1e;
    color: white;
  }

  .option-group h4 {
    color: #999;
  }

  input[type="range"] {
    background: #333;
  }

  input[type="radio"],
  input[type="checkbox"] {
    accent-color: #007AFF;
  }
}
</style> 