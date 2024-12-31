"use client";

import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function Home() {
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<string[]>([]);
	const [input, setInput] = useState("");

	useEffect(() => {
		if (socket.connected) {
			onConnect();
		}

		function onConnect() {
			setIsConnected(true);
			socket.on("previous_messages", (previousMessages) => {
				setMessages(previousMessages);
			});

			socket.on("message", (message) => {
				setMessages((prev) => [...prev, message]);
			});
		}

		function onDisconnect() {
			setIsConnected(false);
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("message");
		};
	}, []);

	const sendMessage = () => {
		if (input.trim()) {
			socket.emit("message", input);
			setInput("");
		}
	};

	return (
		<div>
			<h1>Messaging App</h1>
			<div>
				<p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
			</div>
			<div>
				<ul>
					{messages.map((msg, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<li key={index}>{msg}</li>
					))}
				</ul>
			</div>
			<div>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type a message"
				/>
				<button type="submit" onClick={sendMessage}>
					Send
				</button>
			</div>
		</div>
	);
}
