import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3008;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer);

	io.on("connection", (socket) => {
		console.log("New user connected:", socket.id);

        const messages = [];


		socket.on("message", (data) => {
			console.log("Message received:", data);
            messages.push(data);
			io.emit("message", data);
		});

		socket.emit("welcome", "Welcome to the WebSocket server!");
        socket.emit("previous_messages",messages);

		socket.on("disconnect", (reason) => {
			console.log(`User ${socket.id} disconnected:`, reason);
		});
	});
	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Ready on http://${hostname}:${port}`);
		});
});
