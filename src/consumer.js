const amqp = require('amqplib');
var config = require('./config')

var args = process.argv.slice(1);

const switched = args[1] == 'new' ? true : false
let queueUri = switched ? config['destUri'] : config['sourceUri']

const exchange = switched ? config['destExchange'] : config['sourceExchange'];
const routingKey = config['routingKey'];
const queueName = switched ? config['destQueue'] : config['sourceQueue']

const main = async () => {
    try {
        const connection = await amqp.connect(queueUri);
        console.log(`Subscribing ${switched ? 'new' : ''} cluster at ${queueUri}`);
        const channel = await connection.createConfirmChannel();

        await channel.assertExchange(exchange, 'topic', { durable: true, autoDelete: false, })
        await channel.assertQueue(queueName, { autoDelete: false, durable: true, })

        channel.on('error', (err) => {
            console.log(`!!! Err: ${err}`);
        });

        console.log(` [*] Waiting for messages on exchange ${exchange} on routing key ${routingKey}. To exit press CTRL+C`);
        await channel.bindQueue(queueName, exchange, routingKey);
        await channel.consume(queueName, await processMsg, {
            noAck: false
        })


    } catch (error) {
        console.log(`Fatal error: ${error}`);
        process.exit(1);
    }
}

const processMsg = async (msg) => {
    await new Promise((resolve, reject) => setTimeout(() => {
        resolve(console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString()));
    }, 3000));
}

main();