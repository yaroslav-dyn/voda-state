<!-- Login.vue Component -->
<template>
  <div class="auth-container">
    <div class="auth-header">
      <h2 class="pixel-text app-title">Welcome <br /> to {{APP_NAME}}</h2>
      <p clasds="pixel-text">Stay hydrated and focused!</p>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" v-if="!showSignUp && !showResetPassword" class="auth-form">
      <div class="input-group">
        <label class="pixel-text">Email</label>
        <input
          type="email"
          v-model="loginForm.email"
          required
          :disabled="loading"
          placeholder="your@email.com"
        />
      </div>

      <div class="input-group">
        <label class="pixel-text">Password</label>
        <input
          type="password"
          v-model="loginForm.password"
          required
          :disabled="loading"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" class="auth-btn pixel-btn" :disabled="loading">
       <span class="pixel-text"> {{ loading ? "Signing In..." : "Sign In" }}</span>
      </button>

      <button
        @click="emit('on-close')"
        class="auth-btn --warning pixel-btn pixel-btn-small"
      >
       <span class="pixel-text"> Close</span>
      </button>

      <div class="auth-link pixel-text">
        <p>Don't have an account?</p> <br />
        <a @click="showSignUp = true">Sign up here</a>
      </div>

      <p class="auth-link pixel-text">
        <a @click="() => showResetPassword = true">Forgot password?</a>
      </p>
    </form>

    <!-- Sign Up Form -->
    <form @submit.prevent="handleSignUp" v-if="showSignUp && !showResetPassword" class="auth-form">
      
      <div class="input-group">
        <label class="pixel-text">Email</label>
        <input
          type="email"
          v-model="signUpForm.email"
          required
          :disabled="loading"
          placeholder="your@email.com"
        />
      </div>

      <div class="input-group">
        <label class="pixel-text">Password</label>
        <input
          type="password"
          v-model="signUpForm.password"
          required
          :disabled="loading"
          placeholder="••••••••"
          minlength="6"
        />
      </div>

      <div class="input-group">
        <label class="pixel-text">Confirm Password</label>
        <input
          type="password"
          v-model="signUpForm.confirmPassword"
          required
          :disabled="loading"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" class="auth-btn pixel-btn" :disabled="loading">
        {{ loading ? "Creating Account..." : "💧 Create Account" }}
      </button>

      <p class="auth-link">
        Already have an account?
        <a @click="showSignUp = false">Sign in here</a>
      </p>
    </form>

    <!-- Reset Password Form -->
    <form
      @submit.prevent="handleResetPassword"
      v-if="showResetPassword"
      class="auth-form"
    >
      <div class="input-group">
        <label>Email</label>
        <input
          type="email"
          v-model="resetForm.email"
          required
          :disabled="loading"
          placeholder="your@email.com"
        />
      </div>

      <button type="submit" class="auth-btn" :disabled="loading">
        {{ loading ? "Sending..." : "🔄 Reset Password" }}
      </button>

      <p class="auth-link">
        <a @click="showResetPassword = false">Back to sign in</a>
      </p>
    </form>

    <!-- Error Message -->
    <MessageDisplay v-if="error" type="error" render="static" class="pixel-text">
      {{ error }}
    </MessageDisplay>

    <!-- Success Message -->
    <MessageDisplay v-if="successMessage" type="success" render="static" class="pixel-text">
      {{ successMessage }}
    </MessageDisplay>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "../composables/useEmailAuth";
import MessageDisplay from "./MessageDisplay.vue";
const APP_NAME = import.meta.env.VITE_APP_NAME;
const emit = defineEmits(["on-close"]);

const { loading, error, signIn, signUp, resetPassword } = useAuth();

const showSignUp = ref(false);
const showResetPassword = ref(false);
const successMessage = ref("");

const loginForm = ref({
  email: "",
  password: "",
});

const signUpForm = ref({
  email: "",
  password: "",
  confirmPassword: "",
});

const resetForm = ref({
  email: "",
});

const handleLogin = async () => {
  const result = await signIn(loginForm.value.email, loginForm.value.password);
  if (result.success) {
    successMessage.value = "Welcome back! Stay hydrated! 🌊";
    emit('on-close')
  }
};

const handleSignUp = async () => {
  if (signUpForm.value.password !== signUpForm.value.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }

  const result = await signUp(
    signUpForm.value.email,
    signUpForm.value.password
  );
  if (result.success) {
    successMessage.value =
      "Account created! Check your email for confirmation. 📧";
    showSignUp.value = false;
  }
};

const handleResetPassword = async () => {
  const result = await resetPassword(resetForm.value.email);
  if (result.success) {
    successMessage.value = "Password reset email sent! Check your inbox. 📬";
    showResetPassword.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f0f8ff;
  border: 2px solid #4a90e2;
  border-radius: 8px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  color: #4a90e2;
  margin-bottom: 0.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: bold;
}

.input-group input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.input-group input:focus {
  outline: none;
  border-color: #4a90e2;
}

.input-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 0;
}

.auth-btn:hover:not(:disabled) {
  background: #357abd;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin-top: 1rem;
}

.auth-link a {
  color: #4a90e2;
  cursor: pointer;
  text-decoration: underline;
}

.error-message {
  background: #ffe6e6;
  color: #d32f2f;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}
</style>
