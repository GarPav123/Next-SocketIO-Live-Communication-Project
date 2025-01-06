"use client";
import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import { Send, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import { DialogHeader } from "@/components/ui/dialog";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
} from "@radix-ui/react-dialog";

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
	const [isDialogOpen, setIsDialogOpen] = useState(false);

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
		<div className="flex flex-col h-full bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
			<div className="p-4 border-b border-zinc-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<Avatar className="h-8 w-8 ring-1 ring-zinc-700">
							<AvatarImage
								src={
									user.name === "User 1"
										? "https://github.com/shadcn.png"
										: "/images/ReadyPlayerOne.jpg"
								}
								alt={user.name}
							/>
							<AvatarFallback>{user.name[0]}</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-base font-semibold text-white">
								{user.name}
							</h2>
							<p className="text-xs text-zinc-400">
								Chatting with {otherUser.name}
							</p>
						</div>
					</div>
					<div className="relative flex items-center space-x-1">
						<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
							<DialogTrigger asChild>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="text-zinc-400 hover:text-white hover:bg-zinc-800 w-8 h-8 p-0"
												onClick={() => setIsDialogOpen(true)}
											>
												<Menu size={16} />
											</Button>
										</TooltipTrigger>
										<TooltipContent
											side="bottom"
											className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-lg"
										>
											<p className="text-xs font-medium text-white tracking-wide">
												Open Menu
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</DialogTrigger>

							<DialogContent className="absolute top-0 right-0 mt-2 mr-2 bg-zinc-900 border border-zinc-800 text-white w-40 max-w-lg p-6 rounded-lg shadow-lg">
								<DialogHeader>
									<DialogTitle>Menu Options</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<Button
										variant="ghost"
										className="w-full justify-start text-white hover:bg-zinc-800"
									>
										Profile Settings
									</Button>
									<Button
										variant="ghost"
										className="w-full justify-start text-white hover:bg-zinc-800"
									>
										Preferences
									</Button>
									<Button
										variant="ghost"
										className="w-full justify-start text-white hover:bg-zinc-800"
									>
										Help & Support
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</div>

			<div className="flex-1 p-4 overflow-y-auto bg-zinc-900 space-y-3">
				{messages.map((msg, index) => {
					const isFromCurrentUser = msg.sender === user.id;
					return (
						<div
							key={msg.id || index}
							className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[70%] p-3 rounded-xl ${
									isFromCurrentUser
										? "bg-white text-zinc-900 rounded-br-none"
										: "bg-zinc-800 text-white rounded-bl-none"
								}`}
							>
								<p className="text-xs">{msg.content}</p>
								<span
									className={`text-[10px] mt-1 block ${
										isFromCurrentUser ? "text-zinc-500" : "text-zinc-400"
									}`}
								>
									{msg.created_at
										? new Date(msg.created_at).toLocaleTimeString()
										: ""}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			<div className="p-4 border-t border-zinc-800">
				<div className="flex space-x-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								sendMessage(user, otherUser, input, setInput);
							}
						}}
						placeholder="Type your message..."
						className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:ring-2 focus:ring-white focus:border-transparent h-8 text-xs"
					/>
					<Button
						onClick={() => sendMessage(user, otherUser, input, setInput)}
						className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg h-8 w-8 p-0"
					>
						<Send size={14} />
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-black p-4">
			<div className="max-w-5xl mx-auto space-y-4">
				<div className="text-center mb-4">
					<h1 className="text-2xl font-bold text-white tracking-tight">
						Real Time Messaging by DevTeja
					</h1>
					<p
						className={`text-sm mt-1 ${
							isConnected ? "text-emerald-400" : "text-red-400"
						}`}
					>
						{isConnected ? "Connected to server" : "Disconnected"}
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-4 h-[350px]">
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
