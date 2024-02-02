const { emailGeneration } = require("./emailGeneration");

const cron = require("node-cron");

const notification = async () => {
  // Schedule the task to run every day at 8:00 AM
  cron.schedule(
    "0 8 * * *",
    async () => {
      await emailGeneration();
    },
    {
      scheduled: true,
      timezone: "America/Los_Angeles", // Replace with your actual timezone
    }
  );
};

exports.notification = notification;
