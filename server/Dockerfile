# Stage 1 - Build the base image

FROM node:22-slim AS BASE
WORKDIR /app
COPY src ./src
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install

# Stage 2 - Build the app
FROM base AS build
WORKDIR /app
RUN npm run build

# Stage 3 - Run the app
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --only-production
COPY --from=build /app/build ./

CMD [ "node","main.js" ]
