const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketIO(server)

app.use(express.static(__dirname));

io.on('connection', socket => {
    socket.on('newUser', data => {
        console.log(`${data.name} connected`);
        socket.broadcast.emit('newUserConnected', data);
    })

    socket.on('iAmHereToo', data => {
        io.to(data.to).emit('addThis', {
            userName: data.name,
            userId: data.from
        })
    })

    socket.on('needPeer', data => {
        socket.broadcast.emit('doYou', {
            theirPeer: data.thisIs
        })
    })
    socket.on('peerTo', data => {
        io.to(data.to).emit('doYou', {
            theirPeer: data.thisIs
        })
    })
    socket.on('unPeer', data => {
        io.to(data.to).emit('deletePeer', {
            peerId: data.from
        })
    })

    socket.on('iWantToo', data => {
        io.to(data.to).emit('answer', {
            answeredPeer: data.thisIs
        })
    })

    socket.on('signal', data => {
        const receiverId = data.to;
        const receiverStatus = io.sockets.connected[receiverId];
        if(receiverStatus){
            io.to(receiverId).emit('signal', {
                from: socket.id,
                ...data
            })
        }else{
            console.log('receiver is not online!');
        }
    })

    socket.on('disconnect', reason => {
        console.log(`${socket.id} disconnected`);
        socket.broadcast.emit('userDisconnected', {
            userId: socket.id
        })
    })
})

server.listen(3001, () => {
    console.log(`server is up on port 3001`);
})