<template>
  <div class="stack-container">
    <div class="header">
      <button @click="addItem">Add Item</button>
    </div>
    <div class="content">
      <draggable v-model="internalData">
        <div v-for="item in internalData" :key="item.id">{{ item.content }}</div>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import Draggable from 'vuedraggable'

// 使用 defineProps 定义 props
const props = defineProps({
  modelValue: {
    type: Array as () => Array<{ id: number; content: string }>,
    required: true
  }
})

// 使用 defineEmits 定义 emit
const emit = defineEmits(['update:modelValue'])

const internalData = ref(props.modelValue)

// 监听 internalData 的变化，并 emit 出去
watch(internalData, (newData) => {
  emit('update:modelValue', newData)
})

const addItem = () => {
  internalData.value.push({
    id: Date.now(),
    content: 'Stack Item ' + (internalData.value.length + 1)
  })
}
</script>
