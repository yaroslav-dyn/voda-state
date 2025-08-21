<template>
  <div id="app" :class="themeClass">
    <div class="app-container">
      <!--SECTION: Header -->
      <header class="app-header">
        <div class="app-header__logo">
          <img class="d_logo" :src="dropLogo" :alt="appName" />
          <h1 class="app-title pixel-text">{{ appName }}</h1>
        </div>
        <div
          :class="['user-info', { '--ghost-user': ghostUser }]"
          v-if="!isLoading && (user || ghostUser)"
        >
          <span v-if="!ghostUser" class="user-info__nick pixel-text">{{
            user.email
          }}</span>
          <button
            v-if="user"
            @click="signOut"
            class="user-info__button pixel-btn pixel-btn-small"
          >
            Sign Out
          </button>
          <button
            v-if="ghostUser"
            @click="signOut"
            :class="['user-info__button pixel-btn pixel-btn-small']"
          >
            Exit
          </button>
          <button
            @click="openSettigns"
            class="user-info__settings plane-btn settings-icon"
          >
            <span class="icon_emoji --x-big --bold">⛭</span>
          </button>
        </div>
      </header>

      <!--SECTION: Main Content -->
      <main class="main-content">
        <Auth v-if="!user && !ghostUser" @user-authenticated="handleUserAuth" />

        <div v-else-if="!isLoading" class="app-dashboard">
          <!-- Motivation Message -->
          <div class="motivation-message">
            <p class="pixel-text motivation-text">{{ currentMessage }}</p>
          </div>

          <!-- Timer Section -->
          <section class="timer-section">
            <Timer
              @session-complete="handleSessionComplete"
              @session-start="handleSessionStart"
              @progress-update="updateTimerProgress"
            />
          </section>

          <!-- Bottle Section -->
          <section class="bottle-section">
            <Bottle
              :fill-percentage="timerProgress"
              :is-active="isTimerActive"
            />
          </section>

          <!-- Stats Section -->
          <section class="stats-section">
            <Stats :sessions="userSessions" />
          </section>
        </div>
      </main>

      <Transition name="slide-rihgt">
        <Settings
          v-if="isSettingsOpen"
          isSettingsOpen="isSettingsOpen"
          @close-modal="() => (isSettingsOpen = false)"
        />
      </Transition>

      <!--SECTION: Water Drop Animations -->
      <section class="water-drops" v-if="showDrops">
        <div
          class="water-drop"
          v-for="n in 3"
          :key="n"
          :style="{ '--delay': n * 0.5 + 's' }"
        ></div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import Timer from "./components/Timer.vue";
import Bottle from "./components/Bottle.vue";
import Stats from "./components/Stats.vue";
import Auth from "./components/Auth.vue";
import { useMotivation } from "./composables/useMotivation";
import { getTimeOfDay } from "./utils/timeUtils";
import { useUserStore } from "./stores";
import { storeToRefs } from "pinia";
import dropLogo from "/img/drop_timer_512px.png";
import Settings from "./components/Settings.vue";

const APP_NAME = import.meta.env.VITE_APP_NAME;

const userStore = useUserStore();
const { user, ghostUser, isLoading } = storeToRefs(userStore);

const signOut = userStore.signOut;
const getSessions = userStore.getSessions;
const saveSession = userStore.saveSession;
const { getMessage } = useMotivation();

const appName = ref(APP_NAME);
const timerProgress = ref(0);
const isTimerActive = ref(false);
const showDrops = ref(false);
const isUserLogged = ref(false);
const userSessions = ref([]);
const isSettingsOpen = ref(false);
const currentMessage = ref(
  `Welcome to ${APP_NAME}! Stay hydrated and focused.`
);

// Theme based on time of day
const themeClass = computed(() => {
  const timeOfDay = getTimeOfDay();
  return `theme-${timeOfDay}`;
});

// Handle user authentication
const handleUserAuth = (userData) => {
  currentMessage.value = getMessage("welcome", userData.email);
  isUserLogged.value = !!userData;
  loadUserSessions();
};

// Handle session events
const handleSessionStart = (sessionType) => {
  isTimerActive.value = true;
  showDrops.value = true;
  currentMessage.value = getMessage("session_start", sessionType);
};

const handleSessionComplete = async (sessionData) => {
  isTimerActive.value = false;
  showDrops.value = false;
  timerProgress.value = 0;

  currentMessage.value = getMessage("session_complete", sessionData.type);
  console.log("##handleSessionComplete", showDrops.value);
  // Save to database
  await saveSession(sessionData);
  await loadUserSessions();
};

// Load user sessions
const loadUserSessions = async () => {
  try {
    const sessions = await getSessions();
    userSessions.value = sessions;
  } catch (error) {
    console.error("Failed to load sessions:", error);
  }
};

// Watch for timer progress updates
const updateTimerProgress = (progress) => {
  timerProgress.value = progress;

  // Show motivational messages at certain progress points
  if (progress === 25) {
    currentMessage.value = getMessage("quarter_progress");
  } else if (progress === 50) {
    currentMessage.value = getMessage("half_progress");
  } else if (progress === 75) {
    currentMessage.value = getMessage("three_quarter_progress");
  }
};

const openSettigns = async () => {
  isSettingsOpen.value = !isSettingsOpen.value;
};

watchEffect(async () => {
  await loadUserSessions();
});
</script>
