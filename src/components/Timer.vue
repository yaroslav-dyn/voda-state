<template>
  <div class="timer-container --invert-bg">
    <!-- Timer Display -->
    <div class="timer-display">
      <div class="time-remaining pixel-text">
        {{ formattedTime }}
      </div>
      <div class="session-info">
        <div class="session-type pixel-text">
          <div class="session-type__item" v-if="isWorkTypeLabel">
            <span class="session-type__icon">💼</span>
            <span>Work Time</span>
          </div>
          <div class="session-type__item" v-else>
            <span class="session-type__icon">☕</span>
            <span>Break Time</span>
          </div>
          <div class="session-counter pixel-text">
            Session {{ sessionCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Timer Presets -->
    <div class="timer-presets" v-if="!isActive">
      <h3 class="pixel-text">Work Sessions</h3>
      <div class="preset-group">
        <button
          v-for="preset in getTimePressets().work"
          :key="preset.minutes"
          @click="setTimer(preset.minutes * 60, 'work')"
          class="pixel-btn preset-btn"
          :class="{
            active:
              selectedDuration === preset.minutes * 60 &&
              sessionType === 'work',
          }"
        >
          {{ preset.minutes }}min
        </button>
      </div>

      <h3 class="pixel-text">Break Sessions</h3>
      <div class="preset-group">
        <button
          v-for="preset in getTimePressets().break"
          :key="preset.minutes"
          @click="setTimer(preset.minutes * 60, 'break')"
          class="pixel-btn preset-btn break-btn"
          :class="{
            active:
              selectedDuration === preset.minutes * 60 &&
              sessionType === 'break',
          }"
        >
          {{ preset.minutes }}min
        </button>
      </div>
    </div>

    <!-- Timer Controls -->
    <div class="timer-controls">
      <button
        v-if="!isActive"
        @click="startTimer"
        :disabled="!selectedDuration"
        class="pixel-btn control-btn start-btn"
      >
        🚀 Start
      </button>

      <template v-else>
        <button
          @click="pauseTimer"
          v-if="!isPaused"
          class="pixel-btn control-btn pause-btn"
        >
          <span>⏸️</span> <span>Pause</span>
        </button>
        <button
          @click="resumeTimer"
          v-else
          class="pixel-btn control-btn resume-btn"
        >
          <span>▶️</span> <span>Resume</span>
        </button>
        <button
          @click="() => stopTimer(undefined)"
          class="pixel-btn control-btn stop-btn"
        >
          <span>🛑</span> <span>Stop</span>
        </button>
      </template>

      <button @click="resetTimer" class="pixel-btn control-btn reset-btn">
        <span>🔄</span> <span>Reset</span>
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container" v-if="selectedDuration">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, onMounted, watch, ref } from "vue";
import { storeToRefs } from "pinia";
import { useTimer } from "../composables/useTimer";
import {
  workPresets,
  breakPresets,
  getTimePressets,
  playCompletionSound,
} from "../utils";
import { useSettingsStore } from "../stores";

const emit = defineEmits([
  "session-complete",
  "session-start",
  "progress-update",
]);

const {
  timeRemaining,
  isActive,
  isPaused,
  sessionType,
  selectedDuration,
  sessionCount,
  startTimer: start,
  pauseTimer: pause,
  resumeTimer: resume,
  stopTimer: stop,
  resetTimer: reset,
  setTimer: setDuration,
  setDefaultTimers,
  startTimestamp,
  endTimestamp,
} = useTimer();

const settingsStore = useSettingsStore();
const {
  defaultWorkDuration,
  defaultBreakDuration,
  isStartBreakAuto,
  isStartWorkAuto,
} = storeToRefs(settingsStore);

const isAppActive = ref(false);

// Computed properties
const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
});

const isWorkTypeLabel = computed(() => sessionType.value === "work");

const progressPercentage = computed(() => {
  if (!selectedDuration.value) return 0;
  const timerPersentValue =
    ((selectedDuration.value - timeRemaining.value) / selectedDuration.value) *
    100;
  if (Math.round(timerPersentValue % 5 === 0)) {
    emit("progress-update", timerPersentValue);
  }
  return timerPersentValue;
});

//NOTE: Timer control methods
const startTimer = (type) => {
  start();
  emit("session-start", !type ? sessionType.value : type);
};

const pauseTimer = () => {
  pause();
};

const resumeTimer = () => {
  resume();
};

const stopTimer = (isComplete) => {
  const sessionData = {
    type: sessionType.value,
    duration: selectedDuration.value,
    completed: isComplete ?? false,
    completed_at: new Date().toISOString(),
  };
  stop();
  emit("session-complete", sessionData);
};

const resetTimer = () => {
  reset();
};

const setTimer = (duration, type) => {
  setDuration(duration, type);
};

watch(
  [timeRemaining, isActive, isAppActive],
  ([rTime, sActive, isAppActive]) => {
    if (rTime <= 1 && isActive.value) {
      checkSessionCompletion();
    }
  }
);

// Watch for session completion
const checkSessionCompletion = () => {
  const sessionData = {
    type: sessionType.value,
    duration: selectedDuration.value,
    completed: true,
    created_at: new Date(startTimestamp.value).toISOString(),
    completed_at: new Date(endTimestamp.value).toISOString(),
  };
  emit("session-complete", sessionData);

  // Play completion sound (if enabled)
  playCompletionSound();

  if (isStartBreakAuto.value && sessionType.value === "work") {
    stop();
    setTimer(defaultBreakDuration.value, "break");
    startTimer("break");
  } else if (isStartWorkAuto.value && sessionType.value === "break") {
    stop();
    setTimer(defaultWorkDuration.value, "work");
    startTimer("work");
  }
};

const isAppVisible = () => {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      isAppActive.value = true;
    } else {
      isAppActive.value = false;
    }
  });
};

onMounted(() => {
  setDefaultTimers(defaultWorkDuration, defaultBreakDuration);

  isAppVisible();
});
</script>
