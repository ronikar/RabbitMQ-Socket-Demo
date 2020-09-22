const amqp = require("amqplib/callback_api");
const generateGuid = require("./generateGuid");

module.exports = class RabbitMqRpcChannel {
  constructor(channelName) {
    this.channelName = channelName;
    this.taskCompletedCallBacks = [];

    this.channelPromise = new Promise(resolve => {
      amqp.connect("amqp://localhost", (error0, connection) => {
        if (error0) throw error0;

        connection.createChannel((error1, channel) => {
          if (error1) throw error1;

          channel.assertQueue(channelName, { durable: true });

          channel.assertQueue("", { exclusive: true }, (error2, q) => {
            if (error2) throw error2;

            channel.consume(
              q.queue,
              msg => {
                const content = JSON.parse(msg.content.toString());
                for (const cb of this.taskCompletedCallBacks) cb(msg.properties.correlationId, content);
              },
              { noAck: true }
            );

            resolve({ channel, responeQueue: q });
          });
        });
      });
    });
  }

  onTaskCompleted(cb) {
    this.taskCompletedCallBacks.push(cb);
  }

  async newTask(task) {
    const correlationId = generateGuid();
    const { channel, responeQueue } = await this.channelPromise;

    channel.sendToQueue(this.channelName, Buffer.from(JSON.stringify(task)), {
      contentType: "application/json",
      correlationId,
      replyTo: responeQueue.queue,
    });

    return correlationId;
  }
};
