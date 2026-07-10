"use client";

import Image from "next/image";
import { DashboardProvider } from "./provider";
import Top from "./top";

export default function Shell({ side, main, user }) {
	return (
		<DashboardProvider>
			<div className="w-full flex grow flex-col md:flex-row">
				<div className="grow w-full flex flex-col md:w-1/3">
					<Top {...user} />
					{side}
				</div>
				<div className="md:grow bg-slate-500 md:flex md:items-center md:justify-center md:h-screen">
					{main ? (
						main
					) : (
						<div className="hidden flex-grow md:flex md:items-center md:justify-center">
							<div className="bg-white flex items-center justify-center w-96 h-96 rounded-full">
								<Image
									src="/images/lakar-chat.svg"
									width={280}
									height={280}
									alt=""
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardProvider>
	);
}
