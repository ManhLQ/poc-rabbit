const amqp = require('amqplib/callback_api');
var config = require('./config')

var args = process.argv.slice(1);

const switched = args[1] == 'new' ? true : false
let queueUri = switched ? config['destUri'] : config['sourceUri']

const exchange = switched ? config['destExchange'] : config['sourceExchange'];
const routingKey = config['routingKey'];
const queueName = switched ? config['destQueue'] : config['sourceQueue']

amqp.connect(queueUri, (error0, connection) => {
    if (error0) {
        throw error0;
    }
    console.log(`Subscribing ${switched ? 'new' : ''} cluster at ${queueUri}`);
    connection.createConfirmChannel((error1, channel) => {
        if (error1) {
            throw error1;
        }

        channel.assertExchange(exchange, 'topic', {
            durable: true
        });

        channel.assertQueue(queueName,
            {
                autoDelete: false,
                durable: true,
            }, (error2, q) => {
                if (error2) {
                    throw error2;
                }
                console.log(` [*] Waiting for messages on exchange ${exchange} on routing key ${routingKey}. To exit press CTRL+C`);
                channel.bindQueue(q.queue, exchange, routingKey);
                channel.consume(q.queue, msg => {
                    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
                }, {
                    noAck: true,
                })
            });
    });
});