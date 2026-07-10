import { auth } from "@/app/auth";
import Shell from "./shell";

export default async function Layout({ side, main }) {
	const session = await auth();
	const user = session.user;

	return <Shell side={side} main={main} user={user} />;
}
