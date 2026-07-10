import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

export default auth((req) => {
	const isLoggedIn = !!req.auth;
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/dashboard") && !isLoggedIn) {
		return Response.redirect(new URL("/", req.nextUrl.origin));
	}

	if (pathname === "/" && isLoggedIn) {
		return NextResponse.rewrite(new URL("/dashboard", req.nextUrl.origin));
	}

	if (pathname.match(/^\/[a-f0-9]{24}$/) && isLoggedIn) {
		return NextResponse.rewrite(
			new URL(`/dashboard${pathname}`, req.nextUrl.origin),
		);
	}

	if ((pathname === "/signin" || pathname === "/signup") && isLoggedIn) {
		return Response.redirect(new URL("/", req.nextUrl.origin));
	}
});

export const config = {
	matcher: ["/", "/dashboard/:path*", "/signin", "/signup", "/([a-f0-9]{24})"],
};
