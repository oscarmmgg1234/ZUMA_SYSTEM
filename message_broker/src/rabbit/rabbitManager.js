/*

 Author: Oscar Maldonado
 Email: oscarmmgg1234@gmail.com

 Creation Date: 2025-07-23 11:56:30

 temp

*/
const amqp = require("amqplib");

const RABBIT_URL = "amqp://localhost";

const EXCHANGES = [
  { name: "core.process", type: "fanout" },
  { name: "core.revert", type: "fanout" },
];

let channel;

async function initRabbit(onMessageCallback) {
  const connection = await amqp.connect(RABBIT_URL);
  channel = await connection.createChannel();

  for (const { name, type } of EXCHANGES) {
    await channel.assertExchange(name, type, { durable: true });

    const { queue } = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(queue, name, "");

    console.log(`📡 Listening on exchange: ${name}`);

    channel.consume(
      queue,
      (msg) => {
        if (msg.content) {
          const parsed = JSON.parse(msg.content.toString());
          onMessageCallback({ exchange: name, data: parsed });
        }
      },
      { noAck: true }
    );
  }
}

module.exports = { initRabbit };
