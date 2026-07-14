const isDev = process.env.NODE_ENV !== "production";

const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { createServer } = require("http");
const express = require("express");
const handleConnection = require("./handlers");
const next = require("next");
const { parse } = require("url");

const port = parseInt(process.env.PORT, 10) || 8082;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost/lakar";

const app = next({ dev: isDev });
const handle = app.getRequestHandler();

async function init() {
	await mongoose.connect(MONGO_URL);
	await app.prepare();

	const expressApp = express();

	expressApp.get("/healthz", (req, res) => {
		const dbReady = mongoose.connection.readyState === 1;
		if (dbReady) {
			return res.status(200).json({ status: "ok" });
		}
		return res.status(503).json({ status: "error", db: "disconnected" });
	});

	expressApp.all("*", async (req, res) => {
		const parsedUrl = parse(req.url, true);

		await handle(req, res, parsedUrl);
	});

	const httpServer = createServer(expressApp);
	const io = new Server(httpServer, {
		serveClient: false,
	});

	io.on("connection", handleConnection);

	httpServer.listen(port, '0.0.0.0', () =>
		console.log(`> Ready on http://localhost:${port}`),
	);
}

module.exports = {
	init,
};
