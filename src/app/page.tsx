"use client";
import { useState, useEffect } from "react";
import { socket } from "./socket";
import { Send } from "lucide-react";

type Message = {
	id?: number;
	sender: string;
	recipient: string;
	content: string;
	created_at?: Date;
};

type User = {
	id: string;
	name: string;
};

export default function Home() {
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [user1Input, setUser1Input] = useState("");
	const [user2Input, setUser2Input] = useState("");

	const user1: User = { id: "user1", name: "User 1" };
	const user2: User = { id: "user2", name: "User 2" };

	useEffect(() => {
		if (socket.connected) {
			onConnect();
		}

		function onConnect() {
			setIsConnected(true);
			socket.on("previous_messages", (previousMessages: Message[]) => {
				setMessages(previousMessages);
			});

			socket.on("message", (message: Message) => {
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

	const sendMessage = (
		sender: User,
		recipient: User,
		content: string,
		setInput: (value: string) => void,
	) => {
		if (content.trim()) {
			const messageData: Message = {
				sender: sender.id,
				recipient: recipient.id,
				content: content.trim(),
			};
			socket.emit("message", messageData);
			setInput("");
		}
	};

	const ChatWindow = ({
		user,
		otherUser,
		input,
		setInput,
	}: {
		user: User;
		otherUser: User;
		input: string;
		setInput: (value: string) => void;
	}) => (
		<div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
			<div className="p-4 border-b bg-gray-50">
				<div className="flex items-center space-x-2">
					<div className="w-3 h-3 rounded-full bg-green-500" />
					<h2 className="text-lg font-semibold">{user.name}</h2>
				</div>
				<div className="text-sm text-gray-500">
					Chatting with {otherUser.name}
				</div>
			</div>

			<div className="flex-1 p-4 overflow-y-auto">
				<div className="space-y-4">
					{messages.map((msg, index) => {
						const isFromCurrentUser = msg.sender === user.id;
						return (
							<div
								key={msg.id || index}
								className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[70%] p-3 rounded-lg ${
										isFromCurrentUser
											? "bg-blue-500 text-white rounded-br-none"
											: "bg-gray-100 text-gray-800 rounded-bl-none"
									}`}
								>
									<p className="text-sm">{msg.content}</p>
									<span className="text-xs opacity-75 mt-1 block">
										{msg.created_at
											? new Date(msg.created_at).toLocaleTimeString()
											: ""}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="p-4 border-t">
				<div className="flex space-x-2">
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								sendMessage(user, otherUser, input, setInput);
							}
						}}
						placeholder="Type a message..."
						className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
						onClick={() => sendMessage(user, otherUser, input, setInput)}
						className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
					>
						<Send size={20} />
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-6xl mx-auto space-y-4">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800">
						Real-time Chat Demo
					</h1>
					<p
						className={`mt-2 ${isConnected ? "text-green-500" : "text-red-500"}`}
					>
						{isConnected ? "Connected to server" : "Disconnected"}
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8 h-[600px]">
					<ChatWindow
						user={user1}
						otherUser={user2}
						input={user1Input}
						setInput={setUser1Input}
					/>
					<ChatWindow
						user={user2}
						otherUser={user1}
						input={user2Input}
						setInput={setUser2Input}
					/>
				</div>
			</div>
		</div>
	);
}

