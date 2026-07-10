import connect from "@/lib/mongo/connect";
import messages from "@/lib/mongo/models/messages";

const PAGE_SIZE = 50;

export default async function Messages(req, res) {
	const { id, friend, page = 1 } = req.query;

	await connect();

	const pageNum = Math.max(1, Number(page));
	const skip = (pageNum - 1) * PAGE_SIZE;

	const [_messages, [{ total }]] = await Promise.all([
		messages.find(
			{
				$or: [{ channel: `${friend}_${id}` }, { channel: `${id}_${friend}` }],
			},
			null,
			{ lean: true, sort: { time: -1 }, skip, limit: PAGE_SIZE },
		),
		messages.aggregate([
			{
				$match: {
					$or: [{ channel: `${friend}_${id}` }, { channel: `${id}_${friend}` }],
				},
			},
			{ $count: "total" },
		]),
	]);

	res.json({
		data: _messages,
		page: pageNum,
		totalPages: Math.ceil((total || 0) / PAGE_SIZE),
	});
}
