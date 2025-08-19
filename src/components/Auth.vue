<template>
  <div class="auth-container">
    <!-- Landing Section -->
    <div class="landing-section">
      <h1 class="pixel-text app-title-large">💧 VodaState</h1>
      <p class="pixel-text tagline">Stay hydrated, stay focused</p>
      
      <!-- Demo Bottle -->
      <div class="demo-bottle-container">
        <div class="demo-bottle">
          <div class="bottle-outline"></div>
          <div class="demo-water-fill" :style="{ height: demoFillLevel + '%' }"></div>
          <div class="bottle-cap"></div>
          <div class="demo-bubbles">
            <div class="bubble" v-for="n in 3" :key="n"></div>
          </div>
        </div>
        <p class="pixel-text demo-text">Watch your productivity bottle fill as you focus!</p>
      </div>
      
      <!-- Features -->
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⏱️</div>
          <div class="feature-text pixel-text">
            <strong>Pomodoro Timer</strong><br>
            25, 30, 45 min sessions
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🍶</div>
          <div class="feature-text pixel-text">
            <strong>Visual Progress</strong><br>
            Pixel art bottle fills with water
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <div class="feature-text pixel-text">
            <strong>Track Sessions</strong><br>
            Monitor your productivity streaks
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🌙</div>
          <div class="feature-text pixel-text">
            <strong>Day/Night Themes</strong><br>
            Adapts to your local time
          </div>
        </div>
      </div>
    </div>

    <!-- Authentication Section -->
    <div class="auth-section">
      <div class="auth-card">
        <h2 class="pixel-text">Ready to get started?</h2>
        <p class="pixel-text auth-subtitle">Sign in with Google to save your progress</p>
        
        <!-- Sign In Button -->
        <button 
          @click="signInWithGoogle" 
          :disabled="isLoading"
          class="pixel-btn auth-btn google-btn"
        >
          <span v-if="!isLoading">🔐 Sign in with Google</span>
          <span v-else>⏳ Signing in...</span>
        </button>
        
        <!-- Privacy Note -->
        <p class="pixel-text privacy-note">
          We only access your email to create your account. Your session data is private and secure.
        </p>
        
        <!-- Error Display -->
        <div v-if="error" class="error-message pixel-text">
          ❌ {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'

export default {
  name: 'Auth',
  emits: ['user-authenticated'],
  setup(props, { emit }) {
    const { signInWithGoogle, user } = useSupabase()
    
    const isLoading = ref(false)
    const error = ref('')
    const demoFillLevel = ref(0)
    
    let demoInterval = null

    // Demo bottle animation
    const startDemoAnimation = () => {
      demoInterval = setInterval(() => {
        demoFillLevel.value += 2
        if (demoFillLevel.value >= 100) {
          demoFillLevel.value = 0
        }
      }, 100)
    }

    // Handle Google Sign In
    const handleSignIn = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        await signInWithGoogle();

        console.log('user', user.value);
        
        
        // Wait for user to be set
        if (user.value) {
          emit('user-authenticated', user.value)
        }
      } catch (err) {
        console.error('Sign in error:', err)
        error.value = 'Failed to sign in. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      startDemoAnimation()
    })

    onUnmounted(() => {
      if (demoInterval) {
        clearInterval(demoInterval)
      }
    })

    return {
      demoFillLevel,
      isLoading,
      error,
      signInWithGoogle: handleSignIn
    }
  }
}
</script>
