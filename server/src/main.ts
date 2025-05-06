import dotenv from "dotenv"
import fastify from "fastify"
import fastifyCors from "@fastify/cors"
import fastifySocketIO from "fastify-socket.io"
import { Server } from 'socket.io'
import Redis from "ioredis"
import closeWithGrace from 'close-with-grace'

dotenv.config() // Reads from .env by default
const PORT = parseInt(process.env.PORT || "3001")
const HOST = process.env.HOST || "0.0.0.0" //Setting it to 0.0.0.0 for docker as it can't resolve localhost
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://locahost:3000"
const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT


let currentServerConnectionCounter = 0

// Redis keys
const CONNECTION_COUNT_KEY = 'chat:connection-count'

// Socketio channels
const CONNECTION_COUNT_UPDATED_CHANNEL = 'chat:connection-count-updated'

if (!REDIS_ENDPOINT) {
    console.error("REDIS_ENDPOINT not found")
    process.exit(1)
}


const publisher = new Redis(REDIS_ENDPOINT, {
    tls: {
        rejectUnauthorized: false
    }
})

const subscriber = new Redis(REDIS_ENDPOINT, {
    tls: {
        rejectUnauthorized: false
    }
})

async function buildServer() {
    const app = fastify();

    await app.register(fastifyCors, {
        origin: CORS_ORIGIN,
        credentials: true
    })

    await app.register(fastifySocketIO)

    // On app startup we will check if there are any connections, if connectionCount entry is not present in redis, we will create one with 0 connections.
    const currentConnectionsCount = await publisher.get(CONNECTION_COUNT_KEY)
    if (!currentConnectionsCount) {
        await publisher.set(CONNECTION_COUNT_KEY, 0)
    }

    app.io.on("connection", async (socket) => {
        console.log("Socket connected:", socket.id)

        // Every time a new client connects, we will increment the connection count.
        const incResult = await publisher.incr(CONNECTION_COUNT_KEY)

        // Increment the local server connection count.
        currentServerConnectionCounter++

        await publisher.publish(
            CONNECTION_COUNT_UPDATED_CHANNEL,
            String(incResult)
        );

        socket.on("message", (message) => {
            console.log("Received message:", message)
            socket.broadcast.emit("message", message)
        })
        socket.on("disconnect", async () => {
            console.log("Socket disconnected:", socket.id)
            // Every time a client disconnects, we will decrement the connection count.
            const decrResult = await publisher.decr(CONNECTION_COUNT_KEY);
            await publisher.publish(
                CONNECTION_COUNT_UPDATED_CHANNEL,
                String(decrResult)
            );

            // Decrement the current server connection count
            currentServerConnectionCounter--
        })
    })

    subscriber.subscribe(CONNECTION_COUNT_UPDATED_CHANNEL, (err, count) => {
        if (err) {
            console.error("Failed to subscribe:", err)
            return
        }
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`)
        console.log(`Subscribed successfully! This client is currently subscribed to ${CONNECTION_COUNT_UPDATED_CHANNEL} channel.`)
    })


    // subscriber.on("message") is an emitter which runs when there is new message in any of the subscribed channel. Inside this, we will have to filter out the channel.
    subscriber.on("message", (channel, text) => {
        console.log("Received message from channel: ", channel)
        if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
            console.log("Received message from channel: ", channel)
            app.io.emit(CONNECTION_COUNT_UPDATED_CHANNEL, { count: text })
        }
    })

    app.get("/healthcheck", () => {
        return { staus: "ok", port: PORT }
    })
    return app
}

async function main() {
    const app = await buildServer()
    try {

        // Graceful shutdown handler
        closeWithGrace({ delay: 2000 }, async function ({ signal, err, manual }) {
            if (err) {
                app.log.error({ err }, 'server closing with error')
            } else {
                app.log.info(`${signal} received, server closing`)
            }

            if (currentServerConnectionCounter > 0) {
                console.log(`There are still connections open, closing ${currentServerConnectionCounter} connections`)

                const currentGlobalConnectionCount = parseInt((await publisher.get(CONNECTION_COUNT_KEY) || '0'), 10)
                const newGlobalConnectionCount = Math.max((currentGlobalConnectionCount - currentServerConnectionCounter), 0)
                await publisher.set(CONNECTION_COUNT_KEY, String(newGlobalConnectionCount))
            }

            await app.close()
        })


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


// This is to tell fastify app that there is .io property on app (app.io) of type Server (coming from socketio)
declare module 'fastify' {
    interface FastifyInstance {
        io: Server
    }
}