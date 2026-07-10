const users = require("../models/users");
const messages = require("../models/messages");

async function getCallID(idA, idB) {
	const callParts = await Promise.all([
		users.findById(idA, "joinDate", { lean: true }),
		users.findById(idB, "joinDate", { lean: true }),
	]);
	const callID = callParts
		.sort((a, b) => (a.joinDate > b.joinDate ? +1 : -1))
		.map((e) => e._id.toString())
		.join("_");
	return callID;
}

// Room handling
async function syncUserToRooms(socket, from, to) {
	const callID = await getCallID(from, to);
	socket.join(callID);
	socket.join(to);
}

// Entra a rooms de amigos y canales
async function joinUserToFriendsRooms(socket, id) {
	const { friends } = await users.findOneAndUpdate(
		{ _id: id },
		{ online: true },
		{ select: "friends", lean: true },
	);
	if (friends && friends.length > 0) {
		const onlineFriends = await users.find(
			{ $or: friends.map((_id) => ({ _id })) },
			"_id",
			{ lean: true },
		);
		onlineFriends.forEach(async ({ _id: friendId }) => {
			socket.join(friendId.toString());
			const callID = await getCallID(friendId.toString(), id);
			socket.join(callID);
		});
	}
}

async function addNewFriend(socket, from, to) {
	await syncUserToRooms(socket, from, to);
	const user = await users.findById(from, "-password", { lean: true });
	const friendUser = await users.findById(to, "-password", { lean: true });

	socket.broadcast.emit("new-friend", {
		to,
		from: JSON.stringify(user),
	});

	socket.broadcast.emit("new-friend", {
		to: from,
		from: JSON.stringify(friendUser),
	});
}

async function initCall(socket, callID, offer, from, to) {
	socket.to(to).emit("receive-call", {
		callID,
		from,
		offer,
	});
}

async function endCall(socket, callID) {
	socket.to(callID).emit("end-call");
}

async function disconnectUser(room, id) {
	await users.updateOne({ _id: id }, { online: false });
	room.emit("friend-offline", id);
}

async function sendMessage(socket, message, from, to) {
	const callID = await getCallID(from, to);
	const data = {
		user: from,
		channel: callID,
		time: new Date(),
		content: message,
	};
	socket.to(callID).emit(`message:${from}`, { user: from, ...data });
	await messages.create(data);
}

module.exports = async (socket) => {
	const { id: myId } = socket.handshake.auth;

	socket.join(myId);
	const myRoom = socket.to(myId);
	myRoom.emit("friend-online", myId);

	await joinUserToFriendsRooms(socket, myId);

	// Amigos y sincronización
	socket.on("new-friend", ({ from, to }) => addNewFriend(socket, from, to));
	socket.on("sync-friend", ({ from, to }) => syncUserToRooms(socket, from, to));

	/** --- LLAMADA --- */

	// Iniciar llamada (caller), notificar callee
	socket.on("init-call", async ({ callID, offer, to, from }) => {
		// Normaliza callID si es necesario
		const normalizedCallID = callID || (await getCallID(from, to));
		await initCall(socket, normalizedCallID, offer, from, to);
	});

	// Callee acepta la llamada (habilita video)
	socket.on("accept-call", async ({ from, to }) => {
		const callID = await getCallID(from, to);
		// Notifica a ambos en la sala (caller y callee)
		socket.to(callID).emit("accept-call", { callID, from, to });
	});

	socket.on("toggle-remote-video", async ({ from, to, enabled }) => {
		const callID = await getCallID(from, to);
		socket.to(callID).emit("toggle-remote-video", { enabled });
	});
	// Callee rechaza la llamada
	socket.on("reject-call", async ({ from, to }) => {
		const callID = await getCallID(from, to);
		socket.to(callID).emit("reject-call", { callID, from, to });
		await endCall(socket, callID);
	});

	// Fin de llamada
	socket.on("end-call", async ({ from, to }) => {
		const callID = await getCallID(from, to);
		await endCall(socket, callID);
	});

	// Mensajes en canal
	socket.on("send-message", ({ from, to, message }) =>
		sendMessage(socket, message, from, to),
	);

	/** --- CLEANUP --- */
	socket.on("disconnecting", () => disconnectUser(myRoom, myId));
};
