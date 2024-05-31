module.exports = {
  apps: [
    {
      name: "NotificationService",
      script: "index.js", // Restart at 2:00 AM every day
      // Other configurations like instances, exec_mode etc.
      cron_restart: "0 2 * * *",
      exec_mode: "fork",
      instances: 1,
    },
  ],
};
