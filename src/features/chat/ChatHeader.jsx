"use client";

import { useRouter } from "next/navigation";
import { CiPhone } from "react-icons/ci";
import { FaChevronLeft } from "react-icons/fa";

export default function ChatHeader({ friend, isLoading, onCall }) {
	const router = useRouter();
	const { username, profilePicture, online } = friend;

	return (
		<div className="bg-slate-400 z-10">
			<div className="px-2 py-4 flex items-center bg-slate-700">
				<button onClick={() => router.push("/")} disabled={isLoading}>
					<FaChevronLeft className="w-6 h-6 text-slate-200" />
				</button>

				<div className="relative flex items-center grow">
					{isLoading ? (
						<div className="flex items-center grow animate-pulse">
							<div className="w-12 h-12 bg-slate-300 rounded-full shrink-0" />
							<div className="h-4 ml-2 w-1/2 bg-slate-400 rounded-full" />
						</div>
					) : (
						<>
							<div className="relative">
								<img
									src={profilePicture}
									className="w-12 h-12 rounded-full"
									alt=""
								/>
								<div
									className={`absolute right-0 border-2 border-slate-700 bottom-0 w-4 h-4 ${online ? "bg-green-500" : "bg-red-500"} rounded-full`}
								/>
							</div>
							<div className="grow flex items-center ml-2">
								<span className="text-white">{username}</span>
							</div>
						</>
					)}
				</div>
				<button className="mx-2" onClick={onCall}>
					<CiPhone className="h-8 w-8 text-green-400" />
				</button>
			</div>
		</div>
	);
}
