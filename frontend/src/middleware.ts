import { NextRequest, NextResponse } from "next/server";

export function middleware(cookieName: string, cookieValue: string) {
  const response = NextResponse.next();

  response.cookies.set("new-test", "some-new-value");
  return response;
}

export const config = {
  matcher: "/",
};
