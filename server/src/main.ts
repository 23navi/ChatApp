import dotenv from "dotenv"
import fastify from "fastify"
import fastifyCors from "@fastify/cors"
import fastifySocketIO from "fastify-socket.io"
import { Server } from 'socket.io'

dotenv.config() // Reads from .env by default
const PORT = parseInt(process.env.PORT || "3001")
const HOST = process.env.HOST || "0.0.0.0" //Setting it to 0.0.0.0 for docker as it can't resolve localhost
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://locahost:3000"
const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT

if (!REDIS_ENDPOINT) {
    console.error("REDIS_ENDPOINT not found")
    process.exit(1)
}


async function buildServer() {
    const app = fastify();

    await app.register(fastifyCors, {
        origin: CORS_ORIGIN,
        credentials: true
    })

    await app.register(fastifySocketIO)

    app.io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id)
        socket.on("message", (message) => {
            console.log("Received message:", message)
            socket.broadcast.emit("message", message)
        })
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id)
        })
    })

    app.get("/healthcheck", () => {
        return { staus: "ok", port: PORT }
    })
    return app
}

async function main() {
    const app = await buildServer()
    try {
        await app.listen({
            port: PORT,
            host: HOST
        })
        console.log(`Server started at http://${HOST}:${PORT}`)
    } catch (e) {
        console.error(e)
        process.exit(1)

    }
}

main()




declare module 'fastify' {
    interface FastifyInstance {
        io: Server
    }
}