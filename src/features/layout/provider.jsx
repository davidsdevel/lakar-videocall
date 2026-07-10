"use client";

import cookie from "cookie";
import { useSession } from "next-auth/react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import io from "socket.io-client";
import Call from "./call";

const Context = createContext();

export function useUser() {
	const value = useContext(Context);
	if (!value && process.env.NODE_ENV !== "production") {
		throw new Error(
			"[lettercms]: `useUser` must be wrapped in a <DashboardProvider />",
		);
	}
	return value;
}

export function useFriends(id) {
	const value = useContext(Context);
	if (!value && process.env.NODE_ENV !== "production") {
		throw new Error(
			"[lettercms]: `useUser` must be wrapped in a <DashboardProvider />",
		);
	}
	if (!id) return value.friends;
	return value.friends[id];
}

export function useSocket() {
	const value = useContext(Context);
	if (!value && process.env.NODE_ENV !== "production") {
		throw new Error(
			"[lettercms]: `useUser` must be wrapped in a <DashboardProvider />",
		);
	}
	return value.socket;
}

export async function addFriend(id, friendID) {
	const { __lk_token } = cookie.parse(document.cookie);

	const res = await fetch(`/api/user/${id}/friends`, {
		method: "POST",
		headers: {
			authorization: __lk_token,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			friendID,
		}),
	});

	if (!res.ok) return Promise.reject();
	return res.json();
}

export function DashboardProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [friends, setFriends] = useState({});

	// Estados para llamada
	const [hasCall, setHasCall] = useState(false); // muestra componente de llamada
	const [callID, setCallID] = useState(null); // ID del amigo en llamada
	const [isCaller, setIsCaller] = useState(false); // soy quien inicia llamada
	const [waitingAccept, setWaitingAccept] = useState(false); // esperando aceptación

	const socket = useRef(null);

	const { status, data } = useSession();

	// Iniciar llamada (caller)
	const doCall = (friendID, isOnline) => {
		if (!isOnline) return alert("User offline");

		setHasCall(true);
		setIsCaller(true);
		setCallID(friendID);
		setWaitingAccept(true);

		// Emitir evento de llamada (init-call)
		if (socket.current) {
			socket.current.emit("init-call", {
				callID: undefined, // se normaliza en backend
				to: friendID,
				from: user._id,
				offer: null, // La oferta se agregará después, solo para notificación inicial
			});
		}
	};

	const updateFriends = useCallback(
		(friend) =>
			setUser((prev) => ({
				...prev,
				friends: [...prev.friends, friend],
			})),
		[],
	);

	useEffect(() => {
		if (status === "authenticated" && data) {
			socket.current = io({
				auth: {
					id: data.user.id,
				},
			});

			socket.current.id = data.user.id;

			fetch(`/api/user/${data.user.id}`)
				.then((e) => e.json())
				.then((e) => {
					setUser(e);

					let friendsById = {};
					e.friends.forEach((e) => {
						friendsById[e._id] = e;
					});
					setFriends(friendsById);
					setLoading(false);
				});
		}
	}, [status, data]);

	useEffect(() => {
		if (!user) return;

		const updateUsers = (id, online) => {
			const onlineMap = user.friends.map((e) => {
				if (e._id === id) e.online = online;
				return e;
			});
			setUser((prev) => ({ ...prev, friends: onlineMap }));

			setFriends((prev) => ({
				...prev,
				[id]: {
					...prev[id],
					online: online,
				},
			}));
		};

		const onOnline = (id) => updateUsers(id, true);
		const onOffline = (id) => updateUsers(id, false);

		const handleNewFriend = (newUser) => {
			if (newUser.to === user._id) {
				const from = JSON.parse(newUser.from);
				updateFriends(from);
				socket.current.emit("sync-friend", {
					to: from._id,
					from: user._id,
				});
			}
		};

		// Llamada entrante
		const handleReceiveCall = ({ from }) => {
			setHasCall(true);
			setIsCaller(false);
			setCallID(from);
			setWaitingAccept(false); // pantalla de aceptar, no espera
		};

		// Aceptar llamada
		const handleAcceptCall = () => {
			setWaitingAccept(false); // dejamos de esperar
			// La llamada puede empezar, Call.jsx lo manejará
		};
		// Rechazar llamada
		const handleRejectCall = () => {
			setHasCall(false);
			setCallID(null);
			setIsCaller(false);
			setWaitingAccept(false);
		};
		// Fin de llamada
		const handleEndCall = () => {
			setHasCall(false);
			setCallID(null);
			setIsCaller(false);
			setWaitingAccept(false);
		};

		if (socket.current) {
			socket.current.on("friend-online", onOnline);
			socket.current.on("friend-offline", onOffline);
			socket.current.on("new-friend", handleNewFriend);
			socket.current.on("receive-call", handleReceiveCall);

			socket.current.on("accept-call", handleAcceptCall);
			socket.current.on("reject-call", handleRejectCall);
			socket.current.on("end-call", handleEndCall);

			return () => {
				socket.current.off("friend-online", onOnline);
				socket.current.off("friend-offline", onOffline);
				socket.current.off("new-friend", handleNewFriend);
				socket.current.off("receive-call", handleReceiveCall);
				socket.current.off("accept-call", handleAcceptCall);
				socket.current.off("reject-call", handleRejectCall);
				socket.current.off("end-call", handleEndCall);
			};
		}
	}, [user, friends, updateFriends]);

	const value = loading
		? { loading }
		: {
				user: {
					...user,
					addFriend: (friendID) => addFriend(user._id, friendID),
					updateFriends,
				},
				friends,
				socket: socket.current,
				doCall,
			};

	return (
		<Context.Provider value={value}>
			<div className="h-screen bg-slate-800 flex">{children}</div>
			{hasCall && (
				<Call
					onEndCall={() => {
						setHasCall(false);
						setCallID(null);
						setIsCaller(false);
						setWaitingAccept(false);
					}}
					friendID={callID}
					isCaller={isCaller}
					waitingAccept={waitingAccept}
				/>
			)}
		</Context.Provider>
	);
}
