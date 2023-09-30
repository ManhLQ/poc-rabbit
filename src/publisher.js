const amqp = require('amqplib');
var config = require('./config')

var args = process.argv.slice(1);

const switched = args[1] == 'new' ? true : false
let queueUri = switched ? config['destUri'] : config['sourceUri']

const exchange = switched ? config['destExchange'] : config['sourceExchange'];
const routingKey = config['routingKey'];
const MAX_MSG = 100;
const main = async () => {
    try {
        const connection = await amqp.connect(queueUri);
        console.log(`Connected to ${switched ? 'new' : 'current'} cluster at ${queueUri}`)
        console.log(connection);
        const channel = await connection.createConfirmChannel();
        await channel.assertExchange(exchange, 'topic', { durable: true, autoDelete: false, });
        console.log(`Publishing message to exchange ${exchange} on routing key ${routingKey}`)
        let counter = 1;
        const sendingIntv = setInterval(() => {
            const msg = `Order${switched ? '-new' : ''}-${counter}`;
            console.log(" [x] Sent '%s'", msg);
            channel.publish(exchange, routingKey, Buffer.from(msg))
            counter++;
        }, 1000);
        // Close connection
        // setTimeout(() => {
        //     connection.close();
        //     process.exit(0);
        // }, 500);
    }
    catch (err) {
        process.exit(1);
    }
}

main();