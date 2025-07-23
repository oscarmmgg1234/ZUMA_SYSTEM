/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 11:56:30

 temp

*/
const amqp = require("amqplib");

let channel;
const EXCHANGES = ["core.process", "core.revert"];

async function initRabbit(onMessage) {
  const conn = await amqp.connect(process.env.RABBIT_URL || "amqp://localhost");
  channel = await conn.createChannel();
  for (const ex of EXCHANGES) {
    await channel.assertExchange(ex, "fanout", { durable: true });
    const { queue } = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(queue, ex, "");
    channel.consume(
      queue,
      (msg) => {
        if (msg.content) onMessage(ex, JSON.parse(msg.content.toString()));
      },
      { noAck: true }
    );
  }
}

function publish(exchange, payload) {
  if (!channel) throw new Error("RabbitMQ not initialized");
  channel.publish(exchange, "", Buffer.from(JSON.stringify(payload)));
}

module.exports = { initRabbit, publish };
