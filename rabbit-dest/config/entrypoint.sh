#!/bin/sh

# If definitions have not previously been imported
if [ ! -f /tmp/definitions-imported ]; then
  function import_definitions() {
    until $(curl --output /dev/null --silent --head --fail http://guest:guest@localhost:15672/api/aliveness-test/%2F); do
      sleep 5
    done

    rabbitmqadmin import /tmp/definitions.json

    # Note that definitions have been imported so we don't import them on subsequent container starts
    touch /tmp/definitions-imported
  }
  import_definitions &
fi

exec "$@"