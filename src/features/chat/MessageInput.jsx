"use client";

import { CiPaperplane } from "react-icons/ci";

export default function MessageInput({ message, onChange, onSend }) {
	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div id="message-box" className="flex items-center p-2 w-full">
			<input
				type="text"
				placeholder="Message"
				className="bg-slate-600 text-white grow py-3 pl-6 pr-4 mr-2 rounded-full focus:outline-none"
				onChange={onChange}
				onKeyDown={handleKeyDown}
				value={message}
			/>
			<button
				className="bg-gradient-to-r from-green-400 to-main-500 p-3 rounded-full"
				onClick={onSend}
			>
				<CiPaperplane className="h-6 w-6 text-white" />
			</button>
		</div>
	);
}
