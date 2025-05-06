## Publisher and Subscriber using Redis

Redis is a key value store db but it also gives a build in publisher-subscriber capabilities

To publish to a channel

```ts
const publisher = new Redis(REDIS_ENDPOINT);
publisher.publish("send-user-data", JSON.stringify({ ...req.body }));
```

~~To get message from the channel (Subscribe)~~
NO, Subscriber on redis (redis.subscribe) is to subscribe (one time function, then we will have to do redis.on(), in our case subscriber.on())

```ts
const subscriber = new Redis(REDIS_ENDPOINT);
subscriber.subscribe("send-user-data", (err, count) => {
  if (err) {
    console.error("Error");
    return;
  }
  console.log(`Successfully connected to send-user-data`);
});
```

What is count in this subscribe()?

So redis gives us a way to subscribe to multiple channels.

```ts
const subscriber = new Redis(REDIS_ENDPOINT);
subscriber.subscribe("channel1","channel2","channel3",..., (err, count) => {
  if (err) {
    console.error("Error");
    return;
  }
  console.log(`Successfully connected to ${count} channels`);
});
```


To get message from the channel

```ts
subscriber.on("message", (channel, text) => {
  if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
    console.log("Received message from channel:", channel);
  }
});
```


ioredis documentation: [ioredis npm](https://www.npmjs.com/package/ioredis)