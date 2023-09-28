# POC Rabbit

A POC of forwarding messages from cluster 1 to cluster 2 using Shovel plugin.

## How to run
Build

> docker compose build

Start rabbitmq server

> docker compose up -d

## Scenario

  1. [Publisher] --> (== Source cluster ==) --> [Consumer1]

  2. Configuring shovel on `Destination Cluster`.

  3. `Consumer2` consuming message from `Destination cluster`

  4. `Publisher` sending messages to `Destination cluster`

  5. Configuring shovel on `Source cluster` (message from Source cluster starts forwarding to `Destination cluster`)

  6. Monitoring when `Source cluster` queue is empty.

  7. Shutdown `Consumer1` 

Run consumer

> go run consumer.go orders

`orders` is routing key

Run publisher

> go run publisher.go hello goodbye

where hello and goodbye is message content.

Access management UI
  - Source: http://localhost:15672 guest/guest
  - Dest: http://localhost:25672 guest/guest
