#! /bin/sh

docker compose down
# export REDIS_ENDPOINT= (make sure the env is set manually on the remote server)
export CORS_ORIGIN=https://chat100.navisureka.in
docker compose up -d --build


# chmod -x run.sh 
# ./run.sh