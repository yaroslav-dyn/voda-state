let timerId = null;
let remainingTime = 0;
let isPaused = true;

self.onmessage = function (e) {
  const { command, duration } = e.data;

  switch (command) {
    case 'start':
      if (typeof duration === 'number') {
        remainingTime = duration;
      }
      if (timerId) {
        clearInterval(timerId);
      }
      isPaused = false;
      timerId = setInterval(() => {
        if (!isPaused) {
          remainingTime--;
          self.postMessage({ remainingTime });
          if (remainingTime <= 0) {
            clearInterval(timerId);
            timerId = null;
            self.postMessage({ done: true });
          }
        }
      }, 1000);
      break;

    case 'pause':
      isPaused = true;
      break;

    case 'resume':
      if (timerId) {
        isPaused = false;
      }
      break;

    case 'stop':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      remainingTime = 0;
      isPaused = true;
      self.postMessage({ remainingTime });
      break;

    case 'reset':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      remainingTime = 0;
      isPaused = true;
      self.postMessage({ remainingTime });
      break;

    default:
      // Unknown command
      break;
  }
};