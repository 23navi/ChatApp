# Stage 1 - Build the base image

FROM node:22-slim AS BASE
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY src ./src
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies using pnpm
RUN pnpm install

# Stage 2 - Build the app
FROM base AS build
WORKDIR /app
RUN pnpm run build

# Stage 3 - Run the app
FROM node:22-slim

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY --from=build /app/build ./

CMD [ "node","main.js" ]
