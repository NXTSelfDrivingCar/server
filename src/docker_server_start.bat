docker stop mongo
docker stop node
docker rm mongo
docker rm node

docker-compose build --no-cache
docker-compose up -d --force-recreate --renew-anon-volumes  