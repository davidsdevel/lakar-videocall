"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket, useUser } from "@/features/layout/provider";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

export default function Messages({
	friendId,
	onClose,
	messages: initialMessages,
}) {
	const [message, setMessage] = useState("");
	const [friend, setFriend] = useState({});
	const [messages, setMessages] = useState(initialMessages || []);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const pageRef = useRef(1);
	const totalPagesRef = useRef(1);

	const { user, doCall } = useUser();
	const userRef = useRef(user);
	userRef.current = user;
	const socket = useSocket();

	useEffect(() => {
		if (!friendId || !user) return;

		const controller = new AbortController();

		setIsLoading(true);
		setPage(1);
		pageRef.current = 1;

		fetch(`/api/message/${user._id}?friend=${friendId}&page=1`, {
			signal: controller.signal,
		})
			.then((e) => e.json())
			.then(({ data, totalPages: tp }) => {
				const actualFriend = userRef.current.friends.find(
					(e) => e._id === friendId,
				);

				setMessages(data);
				setFriend(actualFriend || {});
				setTotalPages(tp);
				totalPagesRef.current = tp;
				setIsLoading(false);
			})
			.catch((err) => {
				if (err.name !== "AbortError") setIsLoading(false);
			});

		return () => controller.abort();
	}, [friendId, user?._id]);

	useEffect(() => {
		if (!friendId || !user?.friends) return;
		const latest = user.friends.find((e) => e._id === friendId);
		if (latest) setFriend(latest);
	}, [friendId, user?.friends]);

	useEffect(() => {
		if (!socket || !friend?._id) return;

		const handleMessage = (data) => {
			setMessages((prev) => prev.concat([data]));
		};

		socket.on(`message:${friend._id}`, handleMessage);

		return () => {
			socket.off(`message:${friend._id}`, handleMessage);
		};
	}, [socket, friend?._id]);

	const loadMore = useCallback(() => {
		if (isLoadingMore || pageRef.current >= totalPagesRef.current) return;

		setIsLoadingMore(true);

		const nextPage = pageRef.current + 1;

		fetch(`/api/message/${user._id}?friend=${friendId}&page=${nextPage}`)
			.then((e) => e.json())
			.then(({ data, totalPages: tp }) => {
				setMessages((prev) => [...data.reverse(), ...prev]);
				setPage(nextPage);
				pageRef.current = nextPage;
				setTotalPages(tp);
				totalPagesRef.current = tp;
				setIsLoadingMore(false);
			})
			.catch(() => setIsLoadingMore(false));
	}, [user?._id, friendId, isLoadingMore]);

	const handleSend = () => {
		const trimmed = message.trim();
		if (!trimmed || !socket || !friend?._id) return;

		socket.emit("send-message", {
			message: trimmed,
			from: user._id,
			to: friend._id,
		});

		setMessages((prev) => prev.concat([{ user: user._id, content: trimmed }]));

		setMessage("");
	};

	const handleCall = () => {
		doCall(friendId, friend.online);
		onClose?.();
	};

	if (!friendId) {
		return (
			<div className="hidden flex-grow md:flex md:items-center md:justify-center">
				<div className="bg-white flex items-center justify-center w-96 h-96 rounded-full">
					<Image src="/images/lakar-chat.svg" width={280} height={280} alt="" />
				</div>
			</div>
		);
	}

	return (
		<div className="z-10 absolute w-full h-full top-0 left-0 flex flex-col md:relative bg-slate-800">
			<ChatHeader friend={friend} isLoading={isLoading} onCall={handleCall} />
			<div className="flex-grow flex flex-col w-full h-full pt-20 md:pt-0 md:right-0">
				<MessageList
					messages={messages}
					isLoading={isLoading}
					userId={user?._id}
					friendPicture={friend.profilePicture}
					onLoadMore={loadMore}
					hasMore={page < totalPages}
					isLoadingMore={isLoadingMore}
				/>
				<MessageInput
					message={message}
					onChange={(e) => setMessage(e.target.value)}
					onSend={handleSend}
				/>
			</div>
		</div>
	);
}
