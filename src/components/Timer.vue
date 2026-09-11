<template>
  <div class="timer-container --invert-bg">
    <!-- Timer Display -->
    <div class="timer-display">
      <div class="time-remaining pixel-text">{{ formattedTime }}</div>
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
      <h3 class="pixel-text">Work Sessions ff</h3>
      <div class="preset-group">
        <button
          v-for="preset in getTimePresets().work"
          :key="preset.minutes"
          @click="() => setTimer(preset.minutes * 60, 'work')"
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
          v-for="preset in getTimePresets().break"
          :key="preset.minutes"
          @click="() => setTimer(preset.minutes * 60, 'break')"
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
        @click="() => startTimer()"
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
          @click="() => stopTimer()"
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

<script setup lang="ts">
import { computed, watch, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useWorkerTimer } from "@/composables/useWorkerTimer";
import { getTimePresets, playCompletionSound } from "@/utils";
import { useSettingsStore } from "@/stores";
import type { TSessionType } from "@/types";

const emit = defineEmits<{
  "session-complete": [
    sessionData: {
      type: TSessionType;
      duration: number;
      completed: boolean;
      completed_at: string;
      created_at?: string;
    },
  ];
  "session-start": [sessionType: TSessionType];
  "progress-update": [progress: number];
}>();



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
  setTimer,
  setDefaultTimers,
  startTimestamp,
  endTimestamp,
} = useWorkerTimer();

const settingsStore = useSettingsStore();
const {
  defaultWorkDuration,
  defaultBreakDuration,
  isStartBreakAuto,
  isStartWorkAuto,
} = storeToRefs(settingsStore);

const formattedTime = computed((): string => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

const isWorkTypeLabel = computed((): boolean => sessionType.value === "work");

const progressPercentage = computed((): number => {
  if (!selectedDuration.value) return 0;
  const timerPercentValue =
    ((selectedDuration.value - timeRemaining.value) / selectedDuration.value) *
    100;
  if (Math.round(timerPercentValue) % 5 === 0) {
    emit("progress-update", timerPercentValue);
  }
  return timerPercentValue;
});

const startTimer = (type?: TSessionType): void => {
  start();
  emit("session-start", type || sessionType.value);
};

const pauseTimer = (): void => {
  pause();
};

const resumeTimer = (): void => {
  resume();
};

const stopTimer = (isComplete?: boolean): void => {
  const sessionData = {
    type: sessionType.value,
    duration: selectedDuration.value,
    completed: isComplete ?? false,
    completed_at: new Date().toISOString(),
  };
  stop();
  emit("session-complete", sessionData);
};

const resetTimer = (): void => {
  reset();
};

watch([timeRemaining, isActive], ([rTime, sActive]): void => {
  if (rTime === 1 && sActive) {
    checkSessionCompletion();
  }
});

const checkSessionCompletion = (): void => {
  if (!startTimestamp.value || !endTimestamp.value) return;

  const sessionData = {
    type: sessionType.value,
    duration: selectedDuration.value,
    completed: true,
    created_at: new Date(startTimestamp.value).toISOString(),
    completed_at: new Date(endTimestamp.value).toISOString(),
  };
  setTimeout(() => emit("session-complete", sessionData), 1000);
  playCompletionSound();

  setTimeout(() => {
    if (
      isStartBreakAuto.value &&
      sessionType.value === "work" &&
      defaultBreakDuration.value !== null
    ) {
      stop();
      setTimer(defaultBreakDuration.value, "break");
      startTimer("break");
    } else if (
      isStartWorkAuto.value &&
      sessionType.value === "break" &&
      defaultWorkDuration.value !== null
    ) {
      stop();
      setTimer(defaultWorkDuration.value, "work");
      startTimer("work");
    }
  }, 1000);
};

watchEffect(() => {
  if (!isActive.value) {
    setDefaultTimers(
      defaultWorkDuration.value ?? 0,
      defaultBreakDuration.value ?? 0,
    );
  }
});
</script>
