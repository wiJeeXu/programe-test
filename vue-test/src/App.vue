<template>
  <div>
    <draggable
      class="list-group"
      :list="list1"
      :group="{ name: 'people', pull: 'clone', put: false }"
      @change="log"
      itemKey="name"
    >
      <template #item="{ element, index }">
        <div class="list-group-item">{{ element.name }} {{ index }}</div>
      </template>
    </draggable>
    <draggable class="list-group" :list="list2" group="people" @change="log" itemKey="name">
      <template #item="{ element, index }">
        <div class="list-group-item">{{ element.name }} {{ index }}</div>
      </template>
    </draggable>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'
const list1 = ref([
  { name: 'John', id: 1 },
  { name: 'Joao', id: 2 },
  { name: 'Jean', id: 3 },
  { name: 'Gerard', id: 4 }
])
const list2 = ref([
  { name: 'Juan', id: 5 },
  { name: 'Edgard', id: 6 },
  { name: 'Johnson', id: 7 }
])
function log(evt) {
  window.console.log(evt)
}
</script>
<style scoped>
.buttons {
  margin-top: 35px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.not-draggable {
  cursor: no-drop;
}
</style>
