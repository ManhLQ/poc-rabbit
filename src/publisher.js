const amqp = require('amqplib/callback_api');
var config = require('./config')

var args = process.argv.slice(1);

const switched = args[1] == 'new' ? true : false
let queueUri = switched ? config['destUri'] : config['sourceUri']

console.log(config)
console.log(queueUri);

const exchange = switched ? config['destExchange'] : config['sourceExchange'];
const routingKey = config['routingKey'];

amqp.connect((err, connection) => {
    if (err) return bail(err);
    connection.createChannel((err, channel) => {
        if (err) return bail(err, connection);
        channel.assertExchange(exchange, 'topic', { durable: true }, (err) => {
            if (err) return bail(err, connection);
            let counter = 0;
            while (counter < 5000) {
                const text = `Order-${counter + 1}`
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