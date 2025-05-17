import dotenv from "dotenv"
import fastify from "fastify"
import fastifyCors from "@fastify/cors"
import fastifySocketIO from "fastify-socket.io"
import { Server } from 'socket.io'
import Redis from "ioredis"
import closeWithGrace from 'close-with-grace'
import { randomUUID } from "crypto"

dotenv.config() // Reads from .env by default
const PORT = parseInt(process.env.PORT || "3001")
const HOST = process.env.HOST || "0.0.0.0" //Setting it to 0.0.0.0 for docker as it can't resolve localhost
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000"
const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT


let currentServerConnectionCounter = 0

const NEW_MESSAGE_CHANNEL = "chat:new-message"; // Redis channel
const MESSAGE_KEY = "chat:messages" // To store messages

// function sendMessageToRoom({ room, messageContents }: { room: string, messageContents: string }) {
//     console.log("Publishing the message to room:", room)
//     const channel = `chat:${room}:messages`
//     publisher.publish(channel, JSON.stringify({ room, messageContents }))
// }


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

    await app.register(fastifySocketIO, {
        cors: {
            origin: CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true
        }
    })

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

        // Adding the new message to the channel, adding to channel is not adding the message to the db, for that we have to add it to redis as key value  (const MESSAGE_KEY = "chat:messages" // To store messages)
        socket.on(NEW_MESSAGE_CHANNEL, async (payload: { message: string }) => {

            console.log("Is Buffer?", Buffer.isBuffer(payload)) // So the payload sent by client is not buffer.
            console.log("Type of payload:", typeof payload)
            console.log("Received payload:", payload)

            if (!payload) {
                console.log("Payload is empty")
                return
            }
            await publisher.publish(NEW_MESSAGE_CHANNEL, (JSON.stringify(payload)))
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

    subscriber.subscribe(NEW_MESSAGE_CHANNEL, (err, count) => {
        if (err) {
            console.error("Failed to subscribe:", err)
            return
        }

        // Note: The count here will be 2, why? this count is total count, so we have 1 count from above subscribe, and one with this subscribe.
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`)
        console.log(`Subscribed successfully! This client is currently subscribed to ${NEW_MESSAGE_CHANNEL} channel.`)
    })

    // subscriber.on("message") is an emitter which runs when there is new message in any of the subscribed channel. Inside this, we will have to filter out the channel.
    subscriber.on("message", (channel, text: string) => {
        console.log("Received message from channel: ", channel)
        if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
            console.log("Received message from channel: ", channel)
            app.io.emit(CONNECTION_COUNT_UPDATED_CHANNEL, { count: text })
        }

        // Note: The client must send the json as message (on postman, by default it sends text)
        if (channel === NEW_MESSAGE_CHANNEL) {
            console.log("Received message from channel: ", channel)
            console.log("Type of payload from subscriber", typeof text)
            console.log("Received payload from subscriber:", text)
            const actualMessage = JSON.parse(text)
            console.log("Actual message:", actualMessage.message)
            app.io.emit(NEW_MESSAGE_CHANNEL, { id: randomUUID(), message: actualMessage.message, port: PORT }) // If the value of any key is undefined, it will not be sent in message (eg: {port: undefined won't go in message payload to client on io.emit()})
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