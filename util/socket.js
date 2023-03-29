const { formatGrpMessage } = require('../util/messages');

function setupSocketServer(server) {
    const io = require("socket.io")(server, {
        pingTimeout: 60000,
        cors: {
            origin: "http://localhost:3000"
        }
    });

    const onlineUsers = {};

    io.on('connection', (socket) => {

        socket.on('login', (user) => {
            onlineUsers[socket.id] = user.id;
            io.emit('user-list', Object.values(onlineUsers));
        });

        // group message emitted from client
        socket.on('sending_group_message', (data) => {
            const chat = formatGrpMessage(data.name, data.message, data.groupId);
            socket.broadcast.emit('ReceivedGrpMessage', chat);
        });

        // Handle disconnect event
        socket.on('disconnect', () => {
            const user = onlineUsers[socket.id];
            delete onlineUsers[socket.id];
            io.emit('user-list', Object.values(onlineUsers));
        });
    });
}

module.exports = { setupSocketServer };

