import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Ottieni il token dal cookie o localStorage (simulato via header)
    const token = request.cookies.get('auth-token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '')

    // Definisci le route protette (tutte tranne login)
    const protectedPaths = ['/home', '/dashboard', '/properties']
    const publicPaths = ['/login', '/api/auth']

    const { pathname } = request.nextUrl

    // Se è una route protetta e non c'è token, redirect al login
    if (protectedPaths.some(path => pathname.startsWith(path)) && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Se è il login e c'è un token valido, redirect alla home
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/home', request.url))
    }

    // Per tutte le altre route, procedi normalmente
    return NextResponse.next()
}

export const config = {
    // Applica il middleware a tutte le route tranne quelle statiche
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