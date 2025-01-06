"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const node_http_1 = require("node:http");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const router_1 = require("./src/server/router");
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3008;
const app = (0, next_1.default)({ dev, hostname, port });
const handler = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, node_http_1.createServer)(handler);
    const io = new socket_io_1.Server(httpServer);
    io.on("connection", async (socket) => {
        const caller = router_1.appRouter.createCaller({});
        const previousMessages = await caller.getRecentMessages({
            limit: 50,
            offset: 0,
        });
        socket.emit("previous_messages", previousMessages);
        socket.on("message", async (data) => {
            try {
                const newMessage = await caller.sendMessage({
                    sender: data.sender,
                    recipient: data.recipient,
                    content: data.content,
                });
                io.emit("message", newMessage);
            }
            catch (error) {
                socket.emit("error", "Failed to store message");
            }
        });
        socket.on("disconnect", (reason) => { });
    });
    httpServer
        .once("error", (err) => {
        process.exit(1);
    })
        .listen(port, () => { });
});
