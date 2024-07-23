// src/utils/audio.js

export const playNotificationSound = () => {
  const audio = new Audio(require("../Assets/pianoNoti.mp3"));
  audio.play();
};

export const playConnectedSound = () => {
  const audio = new Audio(require("../Assets/connected.wav"));
  audio.play();
};

export const playDisconnectedSound = () => {
  const audio = new Audio(require("../Assets/disconnected.wav"));
  audio.play();
};
