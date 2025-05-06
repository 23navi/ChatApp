## Application overview

1) We are keeping track of total connections (socket connections), for that we are incrementing and decrementing the count as stroing it in redis as count.

Problem: Say the server was up and it added 3 connection and redis says count:3, but the server goes down, there was no reset of connection count in redis and when the server comes up, it starts from count:3

Solution 1: Everytime the server comes up, we will set the redis connection count to 0. 
But this will not work in case of multiple servers. There can be a case the 1 out of 3 server went down, we can't just reset the connection count.

Solution 2: Handle the server shutdown gracefully and reduce the connection that the particular server was managing.

So, say we have a server X and it was managing 5 connection and the other 2 server was managing 10 connections combined. So in redis, the count will be count: 15

When server X goes down, in the graceful shutdown , it will get the redis connection count and descrent the count of connections it was managing.
count = count -5 



2) Messaging system

So we will have single channel message system in this app for now, we will see how to implement namespaces and rooms for group chats later.


For now we will have one channel (For new message coming, so server will be listining from the client for this channel and then publish the message to redis publisher to a channel) then the subscriber will get the message and publish to all the connected clients (io.emit())





Rooms?

So for any chat, we will have to create isolations. And each isolation will be a seperate room, the concept of room comes from socketio.

Even for 2 person private chat, we will have a room

To handle this at scale, in our db, we can create and store rooms seperately 

Create new chat -> new postgres rooms table entry.

