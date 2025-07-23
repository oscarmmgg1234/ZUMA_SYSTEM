/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 09:22:38

 temp

*/
const amqp = require("amqplib");

const RABBIT_URL = "amqp://localhost";

// Exchanges you want to support
const EXCHANGES = {
  PROCESS: { name: "core.process", type: "fanout" },
  REVERT: { name: "core.revert", type: "fanout" },
};

let connection;
let channel;

const initMQ = async () => {
  if (channel) return channel;

  connection = await amqp.connect(RABBIT_URL);
  channel = await connection.createChannel();

  // Declare both exchanges
  for (const { name, type } of Object.values(EXCHANGES)) {
    await channel.assertExchange(name, type, { durable: true });
    console.log(`✅ Exchange "${name}" of type "${type}" asserted.`);
  }

  return channel;
};

const publishEvent = async (exchangeName, payload) => {
  if (!channel) await initMQ();

  const msg = Buffer.from(JSON.stringify(payload));
  channel.publish(exchangeName, "", msg, { persistent: true });

  console.log(`📤 Published to "${exchangeName}":`, payload);
};

// Expose two methods for convenience
const publishProcessEvent = (payload) =>
  publishEvent(EXCHANGES.PROCESS.name, payload);

const publishRevertEvent = (payload) =>
  publishEvent(EXCHANGES.REVERT.name, payload);

module.exports = {
  initMQ,
  publishProcessEvent,
  publishRevertEvent,
};
