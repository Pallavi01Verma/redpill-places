'use strict';
var redis = require('redis');
var sub = redis.createClient();
var pub = redis.createClient();
sub.subscribe('chat');

module.exports = function(io) {

    io.on('connection', function(socket) {
    var usernames=[];
    socket.on('adduser', function(username){ console.log("username : "+username);
     // we store the username in the socket session for this client
     socket.username = username;
     usernames[0] = username;
     console.log("socket.username  : "+socket.username);
     // add the client's username to the global list
     usernames[username] = username;
     // echo to client they've connected
     socket.emit('updatechat', 'SERVER', 'you have connected');
     // echo globally (all clients) that a person has connected
     socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
     // update the list of users in chat, client-side
     io.sockets.emit('updateusers', usernames);
   });
         /*
         When the user sends a chat message, publish it to everyone (including myself) using
         Redis' 'pub' client we created earlier.
         Notice that we are getting user's name from session.
         */
        socket.on('chat', function(data) { console.log("UserNames : "+usernames[0]);


            var msg = JSON.parse(data);

            console.log("Index event ->MSG : "+data.user);
            console.log(data);
            var reply = JSON.stringify({
                action: 'message',
              //  user: socket.handshake.session.user,
                user: usernames[0],
                msg: msg.msg
            });
            pub.publish('chat', reply);
        });

        /*
         When a user joins the channel, publish it to everyone (including myself) using
         Redis' 'pub' client we created earlier.
         Notice that we are getting user's name from session.
         */
        socket.on('join', function() {
            var reply = JSON.stringify({
                action: 'control',
              //  user: socket.handshake.session.user,
                user: usernames[0],
                msg: ' joined the channel'
            });
             console.dir("REPLY =============="+reply);
             console.log("USER==="+usernames[0]);
             pub.publish('chat', reply);
         
        });

        /*
         Use Redis' 'sub' (subscriber) client to listen to any message from Redis to server.
         When a message arrives, send it back to browser using socket.io
         */
        sub.on('message', function(channel, message) { console.log("Channel : "+channel+"message"+message)
            socket.emit(channel, message);
        });
    })
}
