## Application overview

1) We are keeping track of total connections (socket connections), for that we are incrementing and decrementing the count as stroing it in redis as count.

Problem: Say the server was up and it added 3 connection and redis says count:3, but the server goes down, there was no reset of connection count in redis and when the server comes up, it starts from count:3

Solution 1: Everytime the server comes up, we will set the redis connection count to 0. 
But this will not work in case of multiple servers. There can be a case the 1 out of 3 server went down, we can't just reset the connection count.

Solution 2: Handle the server shutdown gracefully and reduce the connection that the particular server was managing.

So, say we have a server X and it was managing 5 connection and the other 2 server was managing 10 connections combined. So in redis, the count will be count: 15

When server X goes down, in the graceful shutdown , it will get the redis connection count and descrent the count of connections it was managing.
count = count -5 





