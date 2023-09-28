require('dotenv').config({ debug: true });

var config = {
    sourceUri: `${process.env.SRC_CLUSTER || 'amqp://guest:guest@localhost:5672'}/${process.env.SRC_VHOST || ''}`,
    destUri: `${process.env.DEST_CLUSTER || 'amqp://guest:guest@localhost:5672'}/${process.env.DEST_VHOST || ''}`,
    routingKey: process.env.ROUTING_KEY || 'orders',
    sourceExchange: process.env.SRC_EXCH || 'orders',
    destExchange: process.env.DEST_EXCH || 'orders2',
    sourceQueue: process.env.SRC_QUEUE || 'orders.queue',
    destQueue: process.env.DEST_QUEUE || 'orders.queue',
};

module.exports = config