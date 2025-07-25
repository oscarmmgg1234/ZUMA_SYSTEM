#!/bin/bash

echo "⏳ Waiting for RabbitMQ to be available on localhost:5672..."

echo "---- $(date) ----" >> /home/oscy/Documents/zuma/start_broker.log

while ! nc -z localhost 5672; do
  sleep 1
done

echo "✅ RabbitMQ is up. Starting broker service..."
node /home/oscy/Documents/zuma/broker/message_broker/index.js >> /home/oscy/Documents/zuma/start_broker.log 2>&1