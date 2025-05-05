## Publisher and Subscriber using Redis

Redis is a key value store db but it also gives a build in publisher-subscriber capabilities


To publish to a channel
```ts
const publisher = new Redis(REDIS_ENDPOINT)
redis.publish("send-user-data", JSON.stringify({ ...req.body }));
```


To get message from the channel (Subscribe)
```ts
const subscriber = new Redis(REDIS_ENDPOINT)
redis.subscribe("send-user-data",(err,message)=>{
    if(err){
        console.error("Error")
        return;
    }
    console.log(`send-user-data: sent ${message}`) 
});
```
