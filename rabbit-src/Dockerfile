FROM rabbitmq:3.8-management-alpine

RUN apk add curl

COPY ./config/rabbitmq.config /etc/rabbitmq/
COPY ./config/definitions.json /tmp/

COPY ./config/entrypoint.sh /tmp
ENTRYPOINT ["/bin/sh", "/tmp/entrypoint.sh"]

CMD ["rabbitmq-server"]