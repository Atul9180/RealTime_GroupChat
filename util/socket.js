const { formatMessage, formatGrpMessage } = require('../util/messages');

function setupSocketServer(server) {
    const io = require("socket.io")(server, {
        pingTimeout: 60000,
        cors: {
            origin: "http://localhost:3000"
        }
    });;

    //to store list of users associated with their socketid
    var users = {};


    io.on('connection', (socket) => {
        //console.log(`User connected: ${socket.id}`);


        //newuserJoined notified by client listen:
        socket.on("new-user-joined", (token) => {
            console.log({ token })
            //users[socket.id] = username;
            //tell everyone who joined
            // socket.broadcast.emit("user-connected", username);
            //to allusers socket emit a usersList event passing users object
            // io.emit("userConnected", { userId: socket.id, name: token.name });
            // io.emit('user-list', users);

        })


        //groupmsg emitted from client
        socket.on('sending_group_message', (data) => {
            const chat = formatGrpMessage(data.name, data.message, data.groupId)
            // socket.broadcast.emit('ReceivedGrpMessage', { name: chat.user, message: chat.msg, time: chat.time });
            socket.broadcast.emit('ReceivedGrpMessage', chat)
        })


        //listen to send msg from client to send to all
        socket.on('messageSend', (data) => {
            const chat = formatMessage(data.user, data.msg)
            // socket.broadcast.emit('newMessage', { user: chat.user, msg: chat.msg, time:chat.time })
            socket.broadcast.emit('newMessage', { user: chat.user, msg: chat.msg })
        })

        //listen to files send client
        socket.on('filesSend', (data) => {
            socket.broadcast.emit('newFiles', { user: data.user, file: data.file })
        })


        // Handle joinGroup event
        // socket.on('joinGroup', (groupId) => {
        //     // Add the socket to the room for the given group ID
        //     socket.join(groupId);

        //     // Emit a groupJoined event to the socket with the group's messages
        //     const group = findGroupById(groupId);
        //     socket.emit('groupJoined', group);
        // });

        // // Handle sendMessage event
        // socket.on('sendMessage', ({ groupId, message }) => {
        //     // Get the username from the socket (you'll need to implement this yourself)
        //     const username = getUsernameFromSocket(socket);

        //     // Add the message to the group's message array
        //     const group = findGroupById(groupId);
        //     group.messages.push({ username, text: message });

        //     // Emit a newMessage event to all sockets in the group
        //     io.to(groupId).emit('newMessage', { groupId, username, text: message });
        // });

        // Handle disconnect event
        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', user = users[socket.id]);
            io.emit('user-list', users);
            delete (users[socket.id]);
        });
    });
}


// function findGroupById(groupId) {
//     // You'll need to implement this yourself
//     // This function should find the group with the given ID and return it,
//     // or null if no group is found
// }


module.exports = { setupSocketServer };
