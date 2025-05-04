## Chat Application That Scales Horizontally with WebSockets and Upstash Redis

## Features
1. Send and receive messages
1. Show current connection count
1. Create realtime communications with WebSockets
1. Use Redis Pub/Sub to communicate across multiple instances
1. Use Redis to stop data (connection count/ messages)
1. Use Docker and docker-compose to containerize the application
1. Docker multi-stage builds
1. Use GitHub actions to automate CI/CD
1. Graceful shutdowns

## Tech Stack
1. Fastify - Backend
1. Websockets - Realtime 
1. Next.js - Frontend
1. Tailwind & Shadcn UI - Styling
1. Redis - Pub/Sub
1. Docker/docker-compose - Containerization
1. GitHub actions - CI/CD
1. DigitalOcean - Host the backend
1. Vercel - Host the frontend


## Debugging
### Websockets
1. Make sure you are using `wss://` and not `ws://` in production
2. Use debug mode in Caddy server
```
{
    debug
}
```

### Docker
1. List our running docker containers
```bash
docker ps
```
1. Stop a running container
```bash
docker stop <container id>
```

1. Remove a container
```bash
docker rm <container id>
```

1. List out networks
```bash
docker network ls
```

1. Remove a network
```bash
docker network rm <network id>
```
