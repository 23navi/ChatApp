import dotenv from "dotenv"
dotenv.config() // Reads from .env by default



const PORT = parseInt(process.env.PORT || "3001")
const HOST = process.env.HOST || "0.0.0.0" //Setting it to 0.0.0.0 for docker as it can't resolve localhost
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://locahost:3000"
const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT

if (!REDIS_ENDPOINT) {
    console.error("REDIS_ENDPOINT not found")
    process.exit(1)
}


