<template>
  <div
    class="bottle-container --invert-bg">
    <!-- Pixel Art Bottle -->
    <div class="
    bottle
    pixel-bottle"
    :class="{ 'active': isActive }"
  >
    <!-- Bottle Outline -->
    <div class="bottle-outline"></div>

    <!-- Water Fill -->
    <div
      class="water-fill"
      :style="{ height: fillPercentage + '%' }"
    ></div>

    <!-- Bottle Cap -->
    <div class="bottle-cap"></div>

    <!-- Water Surface Effect -->
    <div
      class="water-surface"
      :style="{ bottom: fillPercentage + '%' }"
      v-if="fillPercentage > 0"
    ></div>

    <!-- Bubble Effects -->
    <div
      class="bubbles"
      v-if="isActive && fillPercentage > 10"
    >
      <div
        class="bubble"
        v-for="n in 5"
        :key="n"
        :style="{ 
            '--delay': (n * 0.3) + 's',
            '--x': (20 + n * 10) + '%'
          }"
      ></div>
    </div>
  </div>

  <!-- Fill Percentage Display -->
  <div class="fill-info">
    <span class="pixel-text fill-percentage">{{ Math.round(fillPercentage) }}% Hydrated</span>
  </div>

  <!-- Motivational Fill States -->
  <div
    class="fill-motivation pixel-text"
    v-if="fillMessage"
  >
    {{ fillMessage }}
  </div>
  </div>
</template>

<script>
import { computed, watch, watchEffect } from 'vue'

export default {
  name: 'Bottle',
  props: {
    fillPercentage: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // Motivational messages based on fill level

    
    const fillMessage = computed(() => {
      const fill = props.fillPercentage
      console.log("🚀 ~ setup ~ fill:", fill)
      if (fill === 0) return ''
      if (fill < 25) return '💧 Starting to fill up!'
      if (fill < 50) return '🌊 Good flow going!'
      if (fill < 75) return '💪 More than halfway there!'
      if (fill < 90) return '🚀 Almost fully hydrated!'
      if (fill >= 100) return '🎉 Perfectly hydrated!'
      
      return ''
    })


    return {
      fillMessage
    }
  }
}
</script>
