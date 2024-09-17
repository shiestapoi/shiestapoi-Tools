import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const token = cookies().get("userToken");
  const path = request.nextUrl.pathname;
  const SECRET_KEY = process.env.ENCRYPT_SECRET_KEY || "mahirushiina";
  const generateKey = async (secret: string): Promise<Uint8Array> => {
    return new TextEncoder().encode(secret);
  };
  if (token) {
    try {
      const { payload } = (await jwtVerify(
        token.value,
        await generateKey(SECRET_KEY)
      )) as { payload: { data: { id: string } } };
        if (token.value) {
          if (path === "/login") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
          const response = NextResponse.next();
          response.headers.set("X-User-ID", payload.data.id as string);
          return response;
        } else {
          if (path === "/login") {
            return NextResponse.next();
          } else if (path === "/") {
            return NextResponse.next();
          } else {
            return NextResponse.redirect(new URL("/login", request.url));
          }
        }
    } catch (error) {
      console.error("Kesalahan verifikasi token:", error);
    }
  }

  if (path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
