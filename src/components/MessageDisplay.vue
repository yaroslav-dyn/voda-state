<template>
  <div
    :class="[
      baseClass,
      typeClass,
      classes,
      { 'fixed-top-center': render === 'fixed' }
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['error', 'success'].includes(value),
  },
  render: {
    type: String,
    default: 'static',
    validator: (value) => ['static', 'fixed'].includes(value),
  },
  classes: {
    type: String,
    default: '',
  },
})

const baseClass = 'message-display pixel-text'

const typeClass = computed(() => {
  return props.type === 'error' ? 'message-error' : 'message-success'
})
</script>

<style scoped>
.message-display {
  padding: 1rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  font-weight: 600;
  max-width: 400px;
  box-sizing: border-box;
  word-wrap: break-word;
}

.message-error {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
}

.message-success {
  background-color: #d1e7dd;
  color: #0f5132;
  border: 1px solid #badbcc;
}

.fixed-top-center {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 210;
  max-width: 90vw;
}
</style>