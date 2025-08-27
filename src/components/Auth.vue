<template>
  <div class="auth-container">
    <!--SECTION: Landing Section -->
    <div class="landing-section">
      <h1 class="pixel-text app-title-large --text-modern-dark">VodaState</h1>
      <p class="pixel-text tagline">Stay hydrated, stay focused</p>

      <!-- Demo Bottle -->
      <div class="demo-bottle-container">
        <div class="demo-bottle">
          <div class="bottle-outline"></div>
          <div
            class="demo-water-fill"
            :style="{ height: demoFillLevel + '%' }"
          ></div>
          <div class="bottle-cap"></div>
          <div class="demo-bubbles">
            <div class="bubble" v-for="n in 3" :key="n"></div>
          </div>
        </div>
        <p class="pixel-text demo-text">
          Watch your productivity bottle fill as you focus!
        </p>
      </div>

      <!-- Features -->
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⏱️</div>
          <div class="feature-text pixel-text">
            <strong>Pomodoro Timer</strong><br>
            25, 30, 45, 60 min sessions
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🍶</div>
          <div class="feature-text pixel-text">
            <strong>Visual Progress</strong><br />
            Pixel art bottle fills with water
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <div class="feature-text pixel-text">
            <strong>Track Sessions</strong><br />
            Monitor your productivity streaks
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🌙</div>
          <div class="feature-text pixel-text">
            <strong>Day/Night Themes</strong><br />
            Adapts to your local time
          </div>
        </div>
      </div>
    </div>

    <!--SECTION: Authentication Section -->
    <div class="auth-section">
      <div class="auth-card">
        <h2 class="pixel-text">Ready to get started?</h2>
        <p class="pixel-text auth-subtitle">Sign in to save your progress</p>

        <!-- Sign In Button -->
        <button
          @click="signInWithEmail"
          :disabled="isLoading"
          class="pixel-btn auth-btn email-btn"
        >
          <div class="auth-btn__inner" v-if="!isLoading">
            <span class="icon_emoji --big">🔐</span>
            <span> Sign in with Email</span>
          </div>
          <span v-else>⏳ Signing in...</span>
        </button>

        <!--TODO: Next implementation -->
        <!-- <button
          @click="signInWithGoogle"
          :disabled="isLoading || !isDev"
          class="pixel-btn auth-btn google-btn"
        >
          <div class="auth-btn__inner" v-if="!isLoading">
            <span class="icon_emoji --big">🔐</span>
            <span>
              Sign in with Google {{ !isDev ? "Comming soon!" : "" }}</span
            >
          </div>
          <span v-else>⏳ Signing in...</span>
        </button> -->

        <button
          @click="signInGostMode"
          :disabled="isLoading"
          class="pixel-btn auth-btn --warning google-btn"
        >
          <div class="auth-btn__inner" v-if="!isLoading">
            <span class="icon_emoji --big">👻</span>
            <span> Continue without session</span>
          </div>
          <span v-else>⏳ Signing in...</span>
        </button>

        <!-- Privacy Note -->
        <p class="pixel-text privacy-note">
          We only access your email to create your account. Your session data is
          private and secure.
        </p>

        <!-- Error Display -->
        <div v-if="error" class="error-message pixel-text">❌ {{ error }}</div>
      </div>
    </div>

  <!--SECTION: Auth from -->

    <SignInForm 
      v-if="showSignInModal"
      @on-close="signInWithEmail" 
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted} from "vue";
import { useUserStore } from "../stores/user";
import { storeToRefs } from "pinia";
import SignInForm from "./SignIn.vue";

const emit = defineEmits(["user-authenticated"]);

const userStore = useUserStore();
const signInGostMode = userStore?.signInGostMode;
const { user } = storeToRefs(userStore);
const isDev = ref(import.meta.env.DEV);
const isLoading = ref(false);
const error = ref("");
const demoFillLevel = ref(0);
const showSignInModal = ref(false);

let demoInterval = null;

// Demo bottle animation
const startDemoAnimation = () => {
  demoInterval = setInterval(() => {
    demoFillLevel.value += 2;
    if (demoFillLevel.value >= 100) {
      demoFillLevel.value = 0;
    }
  }, 100);
};

const signInWithEmail = () => {
  showSignInModal.value = !showSignInModal.value;
};

onMounted(async () => {
  startDemoAnimation()
});

onUnmounted(() => {
  if (demoInterval) {
    clearInterval(demoInterval);
  }
});
</script>
