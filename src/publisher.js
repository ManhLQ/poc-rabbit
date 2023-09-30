const amqp = require('amqplib/callback_api');
var config = require('./config')

var args = process.argv.slice(1);

const switched = args[1] == 'new' ? true : false
let queueUri = switched ? config['destUri'] : config['sourceUri']

const exchange = switched ? config['destExchange'] : config['sourceExchange'];
const routingKey = config['routingKey'];
const MAX_MSG = 100;

amqp.connect(queueUri, (err, connection) => {
    console.log(`Connected to ${switched ? 'new' : 'current'} cluster at ${queueUri}`)
    if (err) return bail(err);
    connection.createChannel((err, channel) => {
        if (err) return bail(err, connection);
        channel.assertExchange(exchange, 'topic', { durable: true }, (err) => {
            if (err) return bail(err, connection);
            console.log(`Publishing message to exchange ${exchange} on routing key ${routingKey}`)
            let counter = 0;
            while (counter < MAX_MSG) {
                const text = `Order-${counter + 1 + (switched ? MAX_MSG : 0)}`
                channel.publish(exchange, routingKey, Buffer.from(text));
                console.log(" [x] Sent '%s'", text);
                counter += 1;
            }

            channel.close(() => {
                connection.close();
            });
        });
    });
});

function bail(err, connection) {
    console.error(err);
    if (connection) connection.close(() => {
        process.exit(1);
    });
}