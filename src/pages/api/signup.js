import bcrypt from "bcrypt";
import connect from "@/lib/mongo/connect";
import users from "@/lib/mongo/models/users";

export default async function Signup(req, res) {
	await connect();

	const { body } = req;

	const { password } = body;

	body.password = await bcrypt.hash(password, 10);

	const { _id } = await users.create({
		...body,
		profilePicture: `https://avatar.tobi.sh/${Buffer.from(body.email).toString("hex")}.svg?size=250`,
	});

	res.json({
		_id,
		status: "OK",
	});
}
