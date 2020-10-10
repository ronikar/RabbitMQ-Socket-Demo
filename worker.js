const amqp = require("amqplib/callback_api");
const { queueName } = require("./config");

amqp.connect("amqp://localhost", (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertQueue(queueName, { durable: true });
    channel.prefetch(1);

    process.send("Worker is ready");

    channel.consume(queueName, msg => {
      const n = JSON.parse(msg.content.toString());

      console.log(`Working on task ${msg.properties.correlationId}`, n);

      executeTask().then(() => {
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify("Your'e welcome")), {
          correlationId: msg.properties.correlationId
        });

        channel.ack(msg);
      });
    });
  });
});

function executeTask() {
  const delay = 1 + Math.floor(Math.random() * 5);
  return new Promise(resolve => setTimeout(resolve, delay * 1000));
}
