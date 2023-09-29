# POC Rabbit

A POC of forwarding messages from cluster 1 to cluster 2 using Shovel plugin.

## How to run
Build

> docker compose build

Start rabbitmq server

> docker compose up -d

Access management UI

  - Source: http://localhost:15672 guest/guest

  - Dest: http://localhost:25672 guest/guest

## Scenario

  1. [Publisher] --> (== Source cluster ==) --> [Consumer1]

  2. Configuring shovel on `Destination Cluster`.

  3. `Consumer2` consuming message from `Destination cluster`

  4. `Publisher` sending messages to `Destination cluster`

  5. Configuring shovel on `Source cluster` (message from Source cluster starts forwarding to `Destination cluster`)

  6. Monitoring when `Source cluster` queue is empty.

  7. Shutdown `Consumer1` 

Run consumer

> npm run consumer

Run publisher

> npm run publisher

### Dynamic shovel configuration

Create `orders.exchange` exchange
```sh
curl -i -u guest:guest -H "content-type:application/json" \
    -XPUT -d'{"type":"topic","durable":true}' \
    http://localhost:15672/api/exchanges/%2F/orders.exchange
```

Create queue `orders`
```sh
curl -i -u guest:guest -H "content-type:application/json" \
    -XPUT -d'{"auto_delete":false,"durable":true,"arguments":{}}' \
    http://localhost:15672/api/queues/%2F/orders
```

Bind queue `orders` to exchange `orders.exchange` on routing key `orders`
```sh
curl -i -u guest:guest -H "content-type:application/json" \
    -XPOST -d'{"routing_key":"orders"}' \
    http://localhost:15672/api/bindings/%2F/e/orders.exchange/q/orders
```

Declare shovel `orders.shovel`
```sh
  curl -v -u guest:guest -X PUT http://localhost:15672/api/parameters/shovel/%2f/orders.shovel \
    -H "content-type: application/json" \
    -d @- <<EOF
    {
      "value": {
        "src-protocol": "amqp091",
        "src-uri": "amqp://guest:guest@rabbit-src:5672",
        "src-exchange": "orders.exchange",
        "src-exchange-key": "orders",
        "dest-protocol": "amqp091",
        "dest-uri": "amqp://guest:guest@rabbit-dest:5672", 
        "dest-exchange": "dest.cluster.exchange",
        "dest-exchange-key": "orders",
        "dest-add-forward-headers": true,
        "dest-add-timestamp-header": true
      }
    }
  EOF
```

Delete shovel

```sh
curl -v -u guest:guest -X DELETE http://localhost:15672/api/parameters/shovel/%2f/orders.shovel
```