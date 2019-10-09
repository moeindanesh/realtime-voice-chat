const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketIO(server)

app.use(express.static(__dirname));

io.on('connection', socket => {
    console.log(`user connected`);

    socket.on('needPeer', data => {
        socket.broadcast.emit('doYou', {
            theirPeer: data.thisIs
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
})

server.listen(3001, () => {
    console.log(`server is up on port 3001`);
})