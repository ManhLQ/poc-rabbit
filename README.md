# POC Rabbit

A POC of forwarding messages from cluster 1 to cluster 2 using Shovel plugin.

## How to run
Build

> docker compose build

Start

> docker compose up -d

Run consumer

> go run consumer.go orders

`orders` is routing key

Run publisher

> go run publisher.go hello goodbye

where hello and goodbye is message content.

Access management UI
  - Source: http://localhost:15672 guest/guest
  - Dest: http://localhost:25672 guest/guest
