/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { appRouter } from "./src/server/router";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3008;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer(handler);
	const io = new Server(httpServer);

	io.on("connection", async (socket) => {
		const caller = appRouter.createCaller({});
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
			} catch (error) {
				socket.emit("error", "Failed to store message");
			}
		});

		socket.on("disconnect", (reason) => {});
	});

	httpServer
		.once("error", (err) => {
			process.exit(1);
		})
		.listen(port, () => {});
});
