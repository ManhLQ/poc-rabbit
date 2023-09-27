FROM rabbitmq:3.8-management-alpine

RUN apk add curl

RUN rabbitmq-plugins enable --offline rabbitmq_shovel rabbitmq_shovel_management

COPY ./config/rabbitmq.config /etc/rabbitmq/
COPY ./config/definitions.json /tmp/

COPY ./config/entrypoint.sh /tmp
ENTRYPOINT ["/bin/sh", "/tmp/entrypoint.sh"]

CMD ["rabbitmq-server"]