"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

export default function QrScanner({ onScan, onError }) {
	const scannerRef = useRef(null);
	const startedRef = useRef(false);
	const initRef = useRef(false);

	useEffect(() => {
		if (initRef.current) return;
		initRef.current = true;

		const scanner = new Html5Qrcode("qr-reader");
		scannerRef.current = scanner;

		scanner
			.start(
				{ facingMode: "environment" },
				{ fps: 10, qrbox: { width: 250, height: 250 } },
				(decodedText) => {
					startedRef.current = false;
					onScan?.(decodedText);
					scanner.stop();
				},
				(errorMessage) => {
					onError?.(errorMessage);
				},
			)
			.then(() => {
				startedRef.current = true;
			})
			.catch((err) => {
				onError?.(err);
			});

		return () => {
			if (startedRef.current) {
				scanner.stop().catch(() => {});
			}
		};
	}, []);

	return <div id="qr-reader" className="w-full max-w-sm mx-auto" />;
}
