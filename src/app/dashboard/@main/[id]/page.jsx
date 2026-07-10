import Messages from "@/features/chat";

export default async function Page({ params }) {
	const { id } = await params;

	return <Messages friendId={id} />;
}
