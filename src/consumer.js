const amqp = require('amqplib/callback_api');
var config = require('./config')


var args = process.argv.slice(1);

let queueUri = config['sourceUri']
console.log(args)
if (args[1] == 'new') { // switch to new cluster
    queueUri = config['destUri']
}

console.log(config)
console.log(queueUri);
amqp.connect(queueUri, (error0, connection) => {
    if (error0) {
        throw error0;
    }
    connection.createConfirmChannel((error1, channel) => {
        if (error1) {
            throw error1;
        }
        var exchange = config['sourceExchange'];

        channel.assertExchange(exchange, 'topic', {
            durable: true
        });

        channel.assertQueue(config['sourceQueue'],
            {
                autoDelete: false,
                durable: true,
            }, (error2, q) => {
                if (error2) {
                    throw error2;
                }
                console.log(' [*] Waiting for messages. To exit press CTRL+C');
                channel.bindQueue(q.queue, exchange, config['routingKey']);
                channel.consume(q.queue, msg => {
                    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
                }, {
                    noAck: false,
                })
            });
    });
});