module.exports = {
  apps: [
    {
      name: "Analytics API",
      script: "index.js",
      exec_mode: "fork",
      instances: 1,
      cron_restart: "0 2 * * *", // Restart at 2:00 AM every day
      // Other configurations like instances, exec_mode etc.
    },
  ],
};
