# POC Rabbit

A POC of forwarding messages from cluster 1 to cluster 2 using Shovel plugin.

## Experience learned
- No need to setup shovel plugin in on both sides. Either source or destination cluster is enough; shovel even can be configured in another cluster; as long as the connection to source and destination is ok.

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

Declare shovel `migration.shovel` on `destination cluster`.
```sh
curl -v -u guest:guest -X PUT http://localhost:25672/api/parameters/shovel/checkout/migration.shovel \
  -H "content-type: application/json" \
  -d @- <<EOF
  {
    "value": {
      "src-protocol": "amqp091",
      "src-uri": "amqp://guest:guest@rabbit-src:5672/checkout",
      "src-exchange": "orders.exchange",
      "src-exchange-key": "orders",
      "dest-protocol": "amqp091",
      "dest-uri": "amqp://guest:guest@rabbit-dest:5672/checkout", 
      "dest-exchange": "orders.exchange",
      "dest-exchange-key": "orders",
      "dest-add-forward-headers": true,
      "dest-add-timestamp-header": true
    }
  }
EOF
```

or using cli

```sh
rabbitmqctl set_parameter shovel migration.shovel \
  '{"src-protocol":"amqp091","src-uri":"amqp://guest:guest@rabbit-src:5672/checkout","src-exchange":"orders.exchange","src-exchange-key":"orders","dest-protocol":"amqp091","dest-uri":"amqp://guest:guest@rabbit-dest:5672/checkout","dest-exchange":"orders.exchange","dest-exchange-key":"orders","dest-add-forward-headers":true,"dest-add-timestamp-header":true}'
```

Delete shovel

```sh
curl -v -u guest:guest -X DELETE http://localhost:25672/api/parameters/shovel/%2F/migration.shovel
```

---

Create `orders.exchange` exchange
```sh
curl -i -u guest:guest -H "content-type:application/json" \
    -XPUT -d'{"type":"topic","durable":true}' \
    http://localhost:15672/api/exchanges/checkout/orders.exchange
```

Create queue `orders`
```sh
curl -i -u guest:guest -H "content-type:application/json" \
    -XPUT -d'{"auto_delete":false,"durable":true,"arguments":{}}' \
    http://localhost:15672/api/queues/checkout/orders
```

Bind queue `orders` to exchange `orders.exchange` on routing key `orders`
```sh
curl -i -u guest:guest -H "content-type:application/json" \
    -XPOST -d'{"routing_key":"orders"}' \
    http://localhost:15672/api/bindings/checkout/e/orders.exchange/q/orders
```