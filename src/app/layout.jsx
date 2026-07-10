"use client";

//import { Providers } from './providers'
import { SessionProvider } from "next-auth/react";
import "./globals.css";
//import {Settings} from 'luxon';

export default function RootLayout({ children }) {
	return (
		<html lang="es">
			<body>
				<SessionProvider>{children}</SessionProvider>
			</body>
		</html>
	);
}
