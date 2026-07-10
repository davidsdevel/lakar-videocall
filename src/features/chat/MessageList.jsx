"use client";

import { useEffect, useMemo, useRef } from "react";

function normalizeMessages(messages) {
	const parsedMessages = [];
	let actualMessageList = [];
	let actualID = null;

	messages.forEach((e, i) => {
		if (actualID !== e.user) actualID = e.user;

		actualMessageList.push(e.content);

		const nextMessage = messages[i + 1];

		if (!nextMessage || nextMessage?.user !== e.user) {
			parsedMessages.push({
				id: e.user,
				messages: actualMessageList,
			});

			actualMessageList = [];
		}
	});

	return parsedMessages;
}

export default function MessageList({
	messages,
	isLoading,
	userId,
	friendPicture,
	onLoadMore,
	hasMore,
	isLoadingMore,
}) {
	const listRef = useRef(null);
	const prevLengthRef = useRef(messages.length);

	const normalized = useMemo(() => normalizeMessages(messages), [messages]);

	useEffect(() => {
		if (!listRef.current) return;

		const prevLength = prevLengthRef.current;
		const currentLength = messages.length;

		if (currentLength > prevLength) {
			listRef.current.scrollTo({
				top: listRef.current.scrollHeight,
				behavior: "smooth",
			});
		}

		prevLengthRef.current = currentLength;
	}, [messages.length]);

	const handleScroll = () => {
		if (!listRef.current || isLoadingMore || !hasMore) return;

		if (listRef.current.scrollTop < 80) {
			const scrollHeight = listRef.current.scrollHeight;
			onLoadMore?.();
			requestAnimationFrame(() => {
				if (listRef.current) {
					listRef.current.scrollTop =
						listRef.current.scrollHeight - scrollHeight;
				}
			});
		}
	};

	return (
		<ul
			className="px-4 overflow-y-scroll flex-grow max-h-full"
			ref={listRef}
			onScroll={handleScroll}
		>
			{isLoading ? (
				<li className="flex my-4 animate-pulse">
					<div className="rounded-full w-12 h-12 bg-slate-300" />
					<div className="rounded-xl w-1/2 h-24 bg-slate-400 mx-2" />
				</li>
			) : (
				<>
					{hasMore && (
						<li className="flex justify-center my-2">
							{isLoadingMore ? (
								<div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
							) : (
								<span className="text-slate-500 text-sm">
									Scroll up to load more
								</span>
							)}
						</li>
					)}
					{normalized.map((e, i) => {
						const isActualUser = e.id === userId;

						return (
							<li
								key={`message-group-${i}-${e.id}`}
								className={`flex my-4 ${isActualUser ? "flex-row-reverse" : ""}`}
							>
								{!isActualUser && (
									<div className="w-12 h-12 rounded-full shrink-0 basis-auto grow-0">
										<img src={friendPicture} alt="" className="rounded-full" />
									</div>
								)}
								<ul
									className={`mx-2 flex flex-col ${isActualUser ? "items-end" : "items-start"}`}
								>
									{e.messages.map((j, k) => (
										<li
											key={`msg-${i}-${k}`}
											className="border bg-white mb-2 rounded-2xl p-4 items-start w-fit"
										>
											<span>{j}</span>
										</li>
									))}
								</ul>
							</li>
						);
					})}
				</>
			)}
		</ul>
	);
}
