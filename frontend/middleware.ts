import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const protectedPaths = ['/home', '/dashboard', '/properties', '/configuration', '/actions']

    const { pathname } = request.nextUrl

    // Get the NextAuth token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development"
    })

    // Check if token is expired
    const isTokenExpired = token && token.exp && Date.now() >= (token.exp as number) * 1000

    // If token is expired, clear session and redirect to login
    if (isTokenExpired) {
        const response = NextResponse.redirect(new URL('/', request.url))
        // Clear NextAuth session cookies
        response.cookies.delete('next-auth.session-token')
        response.cookies.delete('__Secure-next-auth.session-token')
        response.cookies.delete('next-auth.csrf-token')
        response.cookies.delete('__Host-next-auth.csrf-token')
        return response
    }

    // If accessing protected path without token, redirect to login
    if (protectedPaths.some(path => pathname.startsWith(path)) && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // If accessing login page with valid token, redirect to home
    if ((pathname === '/login' || pathname == '/signup') && token) {
        return NextResponse.redirect(new URL('/home', request.url))
    }

    // If accessing root with valid token, redirect to home
    // if (pathname === '/' && token) {
    //     return NextResponse.redirect(new URL('/home', request.url))
    // }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}