import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { handleMiddleware } from "./app/middlewre";
import { publicAppRoutes } from "./app/middlewre/app.middleware";

async function middleware(request: NextRequestWithAuth) {
    const url = new URL(request.url);
    const path = url?.pathname
    const urlThatWillNotGetRedirected = ["/plans", "/terms-and-conditions", "/privacy-policy", "/contact-us", "refund-policy"]
    const shouldRedirectToHome = publicAppRoutes.find(p => path.startsWith(p) && !urlThatWillNotGetRedirected.find(u => path.startsWith(u)))
    console.log('inPublicPath', shouldRedirectToHome, path)
    const isApiRoute = path.startsWith("/api")

    if (request?.nextauth?.token && shouldRedirectToHome && !isApiRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.rewrite(url)
    }

}

export default withAuth(middleware, {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        authorized: async ({ req, token }) => {
            const hasPermission = await handleMiddleware(req, token)
            return !!hasPermission
        }
    }
})

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|logo.png|email-background.jpg|manifest.webmanifest|assets|sitemap.xml|robots.txt).*)'
    ]
}