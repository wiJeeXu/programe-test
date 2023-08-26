<template>
  <div class="app">
    <div class="sidebar">
      <button @click="addStackContainer">Add Stack Container</button>
      <button @click="addFreeContainer">Add Free Container</button>
    </div>

    <div class="canvas">
      <draggable v-model="components" group="canvas">
        <component
          v-for="item in components"
          :key="item.id"
          :is="item.type"
          :data="item.data"
          @add="addInsideComponent(item.id)"
        />
      </draggable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Draggable from 'vuedraggable'

const components: any = ref([])

const addStackContainer = () => {
  components.value.push({
    id: Date.now(),
    type: 'StackContainer',
    data: []
  })
}

const addFreeContainer = () => {
  components.value.push({
    id: Date.now(),
    type: 'FreeContainer',
    data: []
  })
}

const addInsideComponent = (containerId: number) => {
  const container = components.value.find((c: any) => c.id === containerId)
  if (container) {
    container.data.push({
      /* your component data */
    })
  }
}
</script>
