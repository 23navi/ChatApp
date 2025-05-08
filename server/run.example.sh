#! /bin/sh

docker compose down
export REDIS_ENDPOINT=
export CORS_ORIGIN=http://localhost:3000
docker compose up -d --build


# chmod -x run.sh 
# ./run.sh