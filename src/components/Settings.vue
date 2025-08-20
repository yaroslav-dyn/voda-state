<template>
  <div :class="['settings-modal', { 'open': isSettingsOpen }]">

    <button
      @click="closeModal"
      class="close-button plane-btn settings-icon"
    >
      <span class="icon_emoji --big --red">✖️</span>
    </button>

    <h3 class="settings-heading pixel-text">Settings</h3>

    <ul>
      <li>
        <div>Defautl Work session</div>
      </li>
    </ul>
  </div>
</template>

<script setup>

const { isSettingsOpen } = defineProps(['isSettingsOpen'])
const emit = defineEmits(['close-modal'])

const closeModal = async () => {
  emit('close-modal');
}

</script>


<style scoped>
  .settings-modal {
    position: fixed;
    right: -100%;
    top: 0;
    background: rgba(255, 255, 255, 0.9);
    border: 3px solid #1f2937;
    border-radius: 8px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    width: 30%;
    height: 100%;
    transition: position 1s ease-in-out 0.4s;
  }
  .settings-modal.open {
    right: 0;
  }
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
  .settings-heading {
    font-size: 1.4rem;
    line-height: 1.4;
    margin-bottom: 1rem;
  }
</style>
