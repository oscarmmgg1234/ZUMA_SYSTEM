const { emailGeneration } = require("./emailGeneration");
const cron = require("node-cron");

const notification = async () => {
  // Schedule the task to run every weekday (Monday to Friday) at 8:00 AM
  cron.schedule(
    "0 8 * * 1-5", // '1-5' specifies Monday to Friday
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
