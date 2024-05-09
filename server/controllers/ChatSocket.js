const { Server } = require("socket.io");
const Messages = require("../models/MessageModel");


const SocketIO = (server) => {

    const io = new Server(server, {
        cors: {
        origin: "http://localhost:3000",
        credentials: true,
        },
    });

    const userSockets = new Map();

    io.on("connection", (socket) => {
        console.log(`User connected ${socket.id}`);

        // Adding users
        socket.on("add-user", (userId) => {
            if (!userSockets.has(userId)) {
                userSockets.set(userId, socket.id);
            }
        });

        //Typing Message
        socket.on("typing_msg", (data) => {
            const { to, from } = data;
            const recipientSocket = userSockets.get(to);
            socket.to(recipientSocket).emit("typing_msg_send", {message: ` is Typing...`,from: from});
        });

        //Stop Typing Message
        socket.on("stop_typing", (data) => {
            const { to, from } = data;
            const recipientSocket = userSockets.get(to);

            socket.to(recipientSocket).emit("stop_typing_send", { from });
        });

        //Receving text messages from client
        socket.on("send_msg", async (data, callback) => {
            const { room, from, to, contentType, message } = data;
            const recipientSocket = userSockets.get(data.to);
            const newMessage = await Messages.create({
                roomId: room,
                sender: from,
                receiver: to,
                content: message,
                contentType,
            });

            //sending text message to client
            if (recipientSocket) {
                socket.to(recipientSocket).emit("receive_msg", { to, from, message, contentType });
                callback({ message: "Message sent successfully" });
            } else {
                callback({ error: "User not found" });
            }
        });

        //Receving Image message from client
        socket.on("send_img", async (data, callback) => {
            const { room, from, to, contentType, message } = data;
            const recipientSocket = userSockets.get(data.to);

            const newImage = await Messages.create({
                roomId: room,
                sender: from,
                receiver: to,
                content: message,
                contentType,
            });

            if (recipientSocket) {
                socket.to(recipientSocket).emit("receive_img", { to, from, message:message, contentType });
                callback({ message: "Image sent successfully" });
            } else {
                callback({ error: "User not found" });
            }
        });

        //Delete all chat messages
        socket.on("delete_chat", (data) => {
            const { to, roomId } = data;
            const recipientSocket = userSockets.get(to);

            socket.to(recipientSocket).emit("updated_chat_messages", { roomId });
        });

        // Disconnecting user
        socket.on("disconnect", () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
                }
            }
            socket.disconnect();
            console.log(`User disconnected ${socket.id}`);
        });
    });
};

module.exports = SocketIO;
