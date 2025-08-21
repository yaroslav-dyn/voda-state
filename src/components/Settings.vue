<template>
  <div
    :class="['settings-modal-wrapper', { open: isSettingsOpen }]"
    @click.self="closeModal"
  >
    <div
      ref="modalContent"
      :class="['settings-modal', { open: isSettingsOpen }]"
    >
      <button
        @click="closeModal"
        class="close-button plane-btn settings-icon"
      >
        <span class="icon_emoji --big --red">✖️</span>
      </button>

      <h3 class="settings-heading pixel-text">Settings</h3>

      <section class="settings_items">
        <div class="settings_item">
          <h3 class="settings_item__heading pixel-text">Defautl Work session</h3>

          <div class="preset-group">
            <button
              v-for="preset in getTimePressets().work"
              :key="preset.minutes"
              @click="setDefaultTimerParams(preset.minutes * 60, 'work')"
              class="pixel-btn preset-btn"
              :class="{
                active: defaultWorkDuration === preset.minutes * 60,
              }"
            >
              {{ preset.minutes }}min
            </button>
          </div>
        </div>

        <div class="settings_item">
          <h3 class="settings_item__heading pixel-text">Break Sessions</h3>

          <div class="preset-group">
            <button
              v-for="preset in getTimePressets().break"
              :key="preset.minutes"
              @click="setDefaultTimerParams(preset.minutes * 60, 'break')"
              class="pixel-btn preset-btn break-btn"
              :class="{
                active: defaultBreakDuration === preset.minutes * 60,
              }"
            >
              {{ preset.minutes }}min
            </button>
          </div>
        </div>
      </section>

      <section :class="['settings_items', { 'disabled_items': !defaultWorkDuration || !defaultBreakDuration }]">
        <div class="settings_item">
          <input
            :disabled="!defaultWorkDuration || !defaultBreakDuration"
            class="settings_pixel__input"
            :checked="isStartWorkAuto"
            @change="changeStartWorkAuto"
            id="isStartWork"
            type="checkbox"
          />
          <label
            for="isStartWork"
            class="settings_item__heading pixel-text"
          >
            Start The work automatically, after break session.
          </label>
        </div>
      </section>

      <section :class="['settings_items', { 'disabled_items': !defaultWorkDuration || !defaultBreakDuration }]">
        <div class="settings_item">
          <input
            :disabled="!defaultWorkDuration || !defaultBreakDuration"
            class="settings_pixel__input"
            :checked="isStartBreakAuto"
            @change="changeStartBreakAuto"
            id="isStartBreak"
            type="checkbox"
          />
          <label
            for="isStartBreak"
            class="settings_item__heading pixel-text"
          >
            Start The break automatically, after work session.
          </label>
        </div>
      </section>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { workPresets, breakPresets, getTimePressets } from "../utils";
const { isSettingsOpen } = defineProps(["isSettingsOpen"]);
const emit = defineEmits(["close-modal"]);
import { useSettingsStore } from "../stores/settings";
const settingsStore = useSettingsStore();
const { setDefaultTimerParams, changeStartBreakAuto, changeStartWorkAuto } = settingsStore;
const {
  defaultWorkDuration,
  defaultBreakDuration,
  isStartBreakAuto,
  isStartWorkAuto
} = storeToRefs(settingsStore);

const modalContent = ref(null);

const closeModal = async () => {
  emit("close-modal");
};

// Optional: Add event listener on document to close modal on outside click (alternative to @click.self)
// onMounted(() => {
//   document.addEventListener("click", handleClickOutside);
// });

// onBeforeUnmount(() => {
//   document.removeEventListener("click", handleClickOutside);
// });

// function handleClickOutside(event) {
//   if (modalContent.value && !modalContent.value.contains(event.target)) {
//     closeModal();
//   }
// }

</script>

<style scoped>
.settings-modal-wrapper {
  position: fixed;
  right: -100%;
  top: 0;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #1f2937;
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  width: 40%;
  height: 100%;
  /* transition: all 1s ease-in-out 0.4s; */
}
@media screen and (max-width: 767px) {
  .settings-modal-wrapper {
    width: 100%;
    overflow-y: auto;
  }
}
.settings-modal-wrapper.open {
  right: 0;
}
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
.settings-heading {
  font-size: 1.8rem;
  line-height: 1.4;
  margin-bottom: 2rem;
}

.settings_items.disabled_items {
  opacity: 0.5;
}

.settings_item {
  margin-bottom: 2.8rem;
}
.settings_item__heading {
  font-size: 1rem;
  margin-bottom: 1.2rem;
}

.slide-rihgt-enter-active {
  transition: all 0.24s ease-in;
}

.slide-rihgt-leave-active {
  transition: all 0.24s ease-out;
}

.slide-rihgt-enter-from,
.slide-rihgt-leave-to {
  /* right: 0; */
  transform: translateX(100%);
}

.preset-group {
  justify-content: flex-start;
}

.preset-btn {
  font-size: 0.8rem;
}

/* Pixel style checkbox input */
.settings_pixel__input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 3px solid #1f2937;
  background-color: #f0f8ff;
  cursor: pointer;
  image-rendering: pixelated;
  position: relative;
  outline-offset: 2px;
  outline: 2px solid transparent;
  transition: outline-color 0.2s ease;
}

.settings_pixel__input:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 1px rgba(0,0,0.6);
}

.settings_pixel__input:checked {
  background-color: #3b82f6;
  border-color: #1e40af;
}

.settings_pixel__input:checked::after {
  content: "";
  position: absolute;
  top: 0;
  left: 3px;
  width: 5px;
  height: 10px;
  display: flex;
  /* flex-direction: column;
  justify-self: center;
  align-self: center;
  align-items: center;
  justify-content: center; */
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
  image-rendering: pixelated;
}
</style>
