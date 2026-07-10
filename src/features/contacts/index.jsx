"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { BsPlus } from "react-icons/bs";
import QRCode from "react-qr-code";
import Button from "@/components/button";
import Input from "@/components/input";
import Modal from "@/components/modal";
import { useSocket, useUser } from "@/features/layout/provider";
import ContactLoader from "./contactLoader";
import ContactTemplate from "./contactTemplate";

const QrScanner = dynamic(() => import("./qrScanner"), {
	ssr: false,
	loading: () => (
		<p className="text-center text-sm text-gray-400">Cargando cámara...</p>
	),
});

export default function Contacts() {
	const [show, setShow] = useState(false);
	const [showScanner, setShowScanner] = useState(false);
	const [friendID, setFriendID] = useState("");
	const [scanStatus, setScanStatus] = useState("idle");

	const { loading, user } = useUser();
	const socket = useSocket();

	const sorted = useMemo(() => {
		if (user)
			return user.friends.sort((a, b) =>
				a.username.localeCompare(b.username, "en", { sensitivity: "base" }),
			);
	}, [user, user?.friends]);

	const handleAddFriend = async () => {
		if (!friendID.trim()) return;
		await user.addFriend(friendID);

		socket.emit("new-friend", {
			from: user._id,
			to: friendID,
		});

		setFriendID("");
		setShow(false);
	};

	const handleScanAddFriend = async (scannedId) => {
		setScanStatus("adding");
		try {
			const res = await user.addFriend(scannedId);
			if (res?.status === "exists-friend") {
				setScanStatus("exists");
				setTimeout(() => {
					setScanStatus("idle");
					setShowScanner(false);
				}, 2000);
				return;
			}
			socket.emit("new-friend", { from: user._id, to: scannedId });
			setScanStatus("success");
			setTimeout(() => {
				setScanStatus("idle");
				setShowScanner(false);
				setShow(false);
			}, 2000);
		} catch {
			setScanStatus("error");
			setTimeout(() => setScanStatus("idle"), 2000);
		}
	};

	const handleCopyId = () => {
		navigator.clipboard.writeText(user._id);
		alert("Copiado");
	};

	return (
		<div className="relative grow">
			<div className="px-4 py-2 md:flex md:flex-col md:w-full md:max-w-2xl md:m-auto">
				{loading ? (
					<ContactLoader />
				) : (
					sorted.map((e) => <ContactTemplate key={"contact-" + e._id} {...e} />)
				)}
			</div>
			<button
				className="bg-gradient-to-br from-green-400 to-main-500 absolute bottom-4 right-4 rounded-full p-2"
				onClick={() => setShow(true)}
			>
				<BsPlus className="text-white h-8 w-8" />
			</button>

			<Modal isOpen={show} close={() => setShow(false)}>
				<div className="rounded-2xl bg-slate-100 px-4 py-8 flex flex-col items-center gap-4 z-[100] w-full max-w-sm mx-4 md:mx-auto">
					<p className="text-sm text-gray-500">Mi ID</p>
					<Input
						type="text"
						disabled
						value={loading ? "" : user._id}
						className="text-center w-full"
					/>
					<Button onClick={handleCopyId}>Copiar ID</Button>
					<div className="bg-white p-4 rounded-xl">
						<QRCode value={loading ? "" : user._id} size={180} />
					</div>
					<hr />

					<p className="text-sm text-gray-500">Friend ID</p>
					<Input
						type="text"
						placeholder="ID del contacto"
						value={friendID}
						onChange={({ target: { value } }) => setFriendID(value)}
						className="w-full"
					/>
					<Button onClick={handleAddFriend}>Agregar Contacto</Button>
					<hr />
					<Button
						onClick={() => {
							setShow(false);
							setShowScanner(true);
						}}
					>
						Escanear Código QR
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={showScanner}
				close={() => {
					if (scanStatus === "idle") setShowScanner(false);
				}}
			>
				<div className="bg-slate-100 flex flex-col justify-center items-center z-[100] w-full h-full md:w-1/2 md:max-w-96 md:h-96 md:rounded-2xl mx-auto">
					{scanStatus === "idle" && showScanner && (
						<QrScanner onScan={(id) => handleScanAddFriend(id)} />
					)}
					{scanStatus === "adding" && (
						<div className="flex flex-col items-center gap-4 p-8">
							<div className="w-10 h-10 border-4 border-main-500 border-t-transparent rounded-full animate-spin" />
							<p className="text-sm text-gray-500">Agregando contacto...</p>
						</div>
					)}
					{scanStatus === "success" && (
						<div className="flex flex-col items-center gap-4 p-8">
							<p className="text-sm text-green-600 font-medium">
								Contacto agregado correctamente
							</p>
						</div>
					)}
					{scanStatus === "exists" && (
						<div className="flex flex-col items-center gap-4 p-8">
							<p className="text-sm text-yellow-600 font-medium">
								El contacto ya fue agregado
							</p>
						</div>
					)}
					{scanStatus === "error" && (
						<div className="flex flex-col items-center gap-4 p-8">
							<p className="text-sm text-red-500 font-medium">
								Error al agregar contacto
							</p>
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
}
