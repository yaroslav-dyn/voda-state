export const workPresets = [
  { minutes: 1 },
  { minutes: 5 },
  { minutes: 25 },
  { minutes: 30 },
  { minutes: 45 },
];

export const breakPresets = [
  { minutes: 1 },
  { minutes: 5 },
  { minutes: 10 },
  { minutes: 15 },
];

export const playCompletionSound = () => {
  // Simple water drop sound using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    400,
    audioContext.currentTime + 0.3
  );

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.3
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};
