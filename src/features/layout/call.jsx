"use client";

import Peer from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	FaMicrophone,
	FaMicrophoneSlash,
	FaPhone,
	FaPhoneSlash,
	FaSync,
	FaVideo,
	FaVideoSlash,
} from "react-icons/fa";
import { useSocket, useUser } from "./provider";

const userConstraints = {
	audio: true,
	video: {
		facingMode: "user",
		width: { max: 426 },
		height: { max: 240 },
	},
};

export default function Call({ onEndCall, friendID, isCaller, waitingAccept }) {
	const receiverRef = useRef(null);
	const senderRef = useRef(null);
	const localStreamRef = useRef(null);
	const peerRef = useRef(null);
	const peerReadyRef = useRef(false);
	const callRef = useRef(null);

	const [isFrontalCamera, setIsFrontalCamera] = useState(true);
	const [isMuted, setIsMuted] = useState(false);
	const [acceptScreen, setAcceptScreen] = useState(!isCaller);
	const [cameraEnabled, setCameraEnabled] = useState(true);
	const [remoteCameraEnabled, setRemoteCameraEnabled] = useState(true);
	const [error, setError] = useState(null);

	const socket = useSocket();
	const { user, friends } = useUser();

	const stopAllTracks = useCallback(() => {
		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach((track) => track.stop());
		}
		if (receiverRef.current?.srcObject) {
			receiverRef.current.srcObject
				.getTracks()
				.forEach((track) => track.stop());
			receiverRef.current.srcObject = null;
		}
		if (senderRef.current?.srcObject) {
			senderRef.current.srcObject.getTracks().forEach((track) => track.stop());
			senderRef.current.srcObject = null;
		}
		localStreamRef.current = null;
	}, []);

	// Inicializar PeerJS 1 sola vez
	useEffect(() => {
		if (!peerRef.current) {
			peerRef.current = new Peer(user._id, {
				config: {
					iceServers: [
						{
							urls: [
								"stun:stun.cloudflare.com:3478",
								"turn:turn.cloudflare.com:3478?transport=udp",
								"turn:turn.cloudflare.com:3478?transport=tcp",
								"turns:turn.cloudflare.com:5349?transport=tcp",
							],
							username:
								"g05d5c3d4f1b8983be7ccac1907517202aea02d82125090236f52fa7e834ff6b",
							credential:
								"1068bcf841b8fe57cd4e476de5f207eaa07a586997d644df28c75b0a7720a58e",
						},
					],
				} /* Sample servers, please use appropriate ones */,
				// Puedes agregar config extra aquí para TURN/STUN si lo requiere tu backend PeerJS
				host: "lakar-signaling.davidsdevel.com",
				port: 443, // Si usas un Proxy Inverso (como Nginx/Traefik) para HTTPS
				path: "/",
				secure: true,
				debug: 2,
			});

			peerRef.current.on("open", () => {
				peerReadyRef.current = true;
			});

			peerRef.current.on("error", () => {
				if (!peerReadyRef.current) {
					setError("Llamada no iniciada");
				}
			});
		}
		return () => {
			stopAllTracks();
			peerRef.current?.destroy();
			peerRef.current = null;
			callRef.current = null;
		};
	}, [user._id, stopAllTracks]);

	// Toggle cámara local/remota
	const toggleCamera = async () => {
		const localStream = localStreamRef.current;

		if (!localStream) return;

		const [videoTrack] = localStream.getVideoTracks();

		if (videoTrack) {
			videoTrack.enabled = !cameraEnabled;
			setCameraEnabled(videoTrack.enabled);

			// Notificar al remoto
			socket.emit("toggle-remote-video", {
				from: user._id,
				to: friendID,
				enabled: videoTrack.enabled,
			});
		}
	};

	const flipCamera = async () => {
		const localStream = localStreamRef.current;

		if (!localStream) return;

		const [videoTrack] = localStream.getVideoTracks();

		if (!videoTrack) return;

		const newFacingMode = isFrontalCamera ? "environment" : "user";

		alert(videoTrack.getSettings().facingMode)

		try {
			await videoTrack.applyConstraints({ facingMode: newFacingMode });
			setIsFrontalCamera(!isFrontalCamera);
		} catch(err) {
			console.error(err)
			// Si falla, no cambiamos el estado
		}
	};

	const toggleMicro = async () => {
		const track = localStreamRef.current?.getAudioTracks()[0];
		if (track) {
			track.enabled = isMuted;
			setIsMuted(!isMuted);
		}
	};

	// Handler aceptar llamada
	const handleAccept = async () => {
		setAcceptScreen(false);
		socket.emit("accept-call", { from: friendID, to: user._id });

		try {
			const localStream =
				await navigator.mediaDevices.getUserMedia(userConstraints);
			localStreamRef.current = localStream;
			if (senderRef.current) senderRef.current.srcObject = localStream;

			if (callRef.current) {
				callRef.current.answer(localStream);
			}
		} catch (_err) {
			setError("Llamada no iniciada");
			socket.emit("end-call", { from: user._id, to: friendID });
		}
	};

	// Handler rechazar llamada
	const handleReject = () => {
		socket.emit("reject-call", { from: friendID, to: user._id });
		endCall();
	};

	// Handler fin de llamada
	const endCall = useCallback(() => {
		callRef.current?.close();
		peerRef.current?.disconnect();
		stopAllTracks();
		setAcceptScreen(!isCaller);
		onEndCall();
	}, [onEndCall, isCaller, stopAllTracks]);

	// Handler cancelar llamada (Caller)
	const handleCancelCall = () => {
		socket.emit("end-call", { from: user._id, to: friendID });
		endCall();
	};

	// Pantalla aceptar/rechazar y handlers PeerJS
	useEffect(() => {
		const handleRemoteVideo = ({ enabled }) => {
			setRemoteCameraEnabled(enabled);
		};

		socket.on("toggle-remote-video", handleRemoteVideo);

		const handleIncomingCall = (call) => {
			callRef.current = call;
			const localStream = localStreamRef.current;
			if (localStream) {
				call.answer(localStream);
				call.on("stream", (remoteStream) => {
					if (receiverRef.current) {
						receiverRef.current.srcObject = remoteStream;
					}
				});
				call.on("close", endCall);
			}
		};

		if (!isCaller) {
			peerRef.current?.on("call", handleIncomingCall);
		}

		return () => {
			socket.off("toggle-remote-video", handleRemoteVideo);
			if (peerRef.current) {
				peerRef.current.off("call", handleIncomingCall);
			}
		};
	}, [socket, isCaller]);

	// Caller: iniciar la llamada PeerJS
	useEffect(() => {
		async function run() {
			if (isCaller) {
				try {
					const localStream =
						await navigator.mediaDevices.getUserMedia(userConstraints);

					localStreamRef.current = localStream;
					if (senderRef.current) senderRef.current.srcObject = localStream;

					if (!peerReadyRef.current) {
						await new Promise((resolve) => {
							peerRef.current.on("open", resolve);
						});
					}

					const call = peerRef.current.call(friendID, localStream);
					callRef.current = call;
					call.on("stream", (remoteStream) => {
						receiverRef.current.srcObject = remoteStream;
					});
					call.on("close", endCall);
				} catch (_err) {
					setError("Llamada no iniciada");
					socket.emit("end-call", { from: user._id, to: friendID });
				}
			}
		}
		if (isCaller && !waitingAccept && !acceptScreen) {
			run();
		}
	}, [isCaller, friendID, waitingAccept, acceptScreen]);

	// Escuchar end-call remoto para limpiar tracks antes del desmonte
	useEffect(() => {
		const handleRemoteEndCall = () => {
			stopAllTracks();
			callRef.current?.close();
			callRef.current = null;
		};

		socket.on("end-call", handleRemoteEndCall);
		return () => {
			socket.off("end-call", handleRemoteEndCall);
		};
	}, [socket, stopAllTracks]);

	// Auto-cierre de pantalla de error
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				onEndCall();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [error, onEndCall]);

	// Pantalla de error
	if (error) {
		return (
			<div className="fixed w-full h-full top-0 flex flex-col items-center z-30 bg-slate-800 justify-center">
				<div className="text-white text-lg font-bold mb-4">{error}</div>
				<button
					className="bg-red-500 p-8 rounded-full text-white font-bold text-xl"
					onClick={() => onEndCall()}
				>
					<FaPhoneSlash className="inline mr-2" />
					Cerrar
				</button>
			</div>
		);
	}

	// Pantalla aceptar/rechazar
	if (acceptScreen) {
		return (
			<div className="fixed w-full h-full top-0 flex flex-col items-center z-30 bg-slate-800 justify-center">
				<div className="text-white text-lg font-bold mb-4">
					{friends[friendID]?.username || "Amigo"} te está llamando...
				</div>
				<div className="flex space-x-8">
					<button
						className="bg-green-500 p-8 rounded-full text-white font-bold text-xl"
						onClick={handleAccept}
					>
						<FaPhone className="inline mr-2" />
						Aceptar
					</button>
					<button
						className="bg-red-500 p-8 rounded-full text-white font-bold text-xl"
						onClick={handleReject}
					>
						<FaPhoneSlash className="inline mr-2" />
						Rechazar
					</button>
				</div>
			</div>
		);
	}

	// Pantalla de espera (Caller)
	if (waitingAccept && isCaller) {
		return (
			<div className="fixed w-full h-full top-0 flex flex-col items-center z-30 bg-slate-800 justify-center">
				<div className="text-white text-lg font-bold mb-4">
					Llamando a {friends[friendID]?.username || "Amigo"}...
				</div>
				<button
					className="bg-red-500 p-8 rounded-full text-white font-bold text-xl"
					onClick={handleCancelCall}
				>
					<FaPhoneSlash className="inline mr-2" />
					Cancelar
				</button>
			</div>
		);
	}

	// Pantalla principal videollamada
	return (
		<div className="fixed w-full h-full top-0 flex flex-col items-center z-20">
			<div
				id="main-screen"
				className="w-full h-full bg-slate-800 grow flex items-center justify-center relative"
			>
				<div className="fixed w-full h-full flex items-center justify-center">
					<img
						src={friends[friendID]?.profilePicture}
						alt=""
						className="rounded-full"
					/>
				</div>
				<video
					ref={receiverRef}
					playsInline
					className={`z-10 w-full h-full max-w-full max-h-full${remoteCameraEnabled ? "" : " hidden"}`}
					autoPlay
				/>
				<video
					ref={senderRef}
					autoPlay
					muted
					playsInline
					className="absolute top-4 right-4 w-24 md:w-40"
				/>
			</div>
			<div className="absolute z-20 bg-[#fff2] justify-between flex items-center rounded-full bottom-4">
				<button
					className="flex m-2 items-center justify-center p-5 bg-main-700 rounded-full h-fit"
					onClick={flipCamera}
				>
					<FaSync className="text-white" />
				</button>
				<button
					className="flex m-2 items-center justify-center p-5 bg-main-700 rounded-full h-fit"
					onClick={toggleCamera}
				>
					{cameraEnabled ? (
						<FaVideoSlash className="text-white" />
					) : (
						<FaVideo className="text-white" />
					)}
				</button>
				<button
					className="flex m-2 items-center justify-center p-5 bg-main-700 rounded-full h-fit"
					onClick={toggleMicro}
				>
					{isMuted ? (
						<FaMicrophone className="text-white" />
					) : (
						<FaMicrophoneSlash className="text-white" />
					)}
				</button>
				<button
					className="flex m-2 items-center justify-center p-5 bg-red-500 rounded-full"
					onClick={handleCancelCall}
				>
					<FaPhoneSlash className="text-white" />
				</button>
			</div>
		</div>
	);
}
