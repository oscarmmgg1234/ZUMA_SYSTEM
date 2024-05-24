// src/utils/audio.js

export const playNotificationSound = () => {
  const audio = new Audio(require("../Assets/pianoNoti.mp3"));
  audio.play();
};
