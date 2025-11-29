import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signin`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            username: credentials.username,
                            password: credentials.password,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data?.token) {
                            try {
                                const tokenPayload = JSON.parse(
                                    Buffer.from(data.token.split('.')[1], 'base64').toString('utf-8')
                                );

                                const user = {
                                    id: tokenPayload.id,
                                    username: tokenPayload.sub || credentials.username,
                                    email: tokenPayload.email || undefined,
                                    companyId: tokenPayload.companyId || undefined,
                                    companyName: tokenPayload.companyName || undefined,
                                    mainProjectId: tokenPayload.mainProjectId || undefined,
                                    mainProjectName: tokenPayload.mainProjectName || undefined,
                                };

                                return {
                                    id: String(user.id),
                                    name: user.username,
                                    email: user.username, // Use username as email fallback
                                    backendUser: user,
                                    backendToken: data.token,
                                };
                            } catch {
                                return null;
                            }
                        }
                    }
                    return null;
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // For credentials provider, authentication is already handled in authorize()
            if (account?.provider === "credentials") {
                return true;
            }


            // For Google OAuth, call the backend social-signin endpoint
            if (account?.provider === "google" && profile?.email) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/social-signin`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            provider: "google",
                            providerId: profile.sub,
                            email: profile.email,
                            firstName: (profile as any).given_name || "",
                            lastName: (profile as any).family_name || "",
                        }),
                    });

                    if (response.ok) {
                        const backendResponse = await response.json();
                        const token = backendResponse.Token || backendResponse.token;

                        if (token) {
                            try {
                                const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                    },
                                });

                                if (userResponse.ok) {
                                    const backendUser = await userResponse.json();
                                    (user as any).backendUser = backendUser;
                                    (user as any).backendToken = token;
                                    return true;
                                }
                            } catch { }
                        }

                        (user as any).backendToken = token;
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            }

            return true;
        },
        async jwt({ token, user, trigger }) {
            // Persist the user data and backend token to the JWT token
            if (user) {
                token.backendUser = (user as any).backendUser;
                token.backendToken = (user as any).backendToken;
            }
            return token;
        },
        async session({ session, token }) {
            // If we have a backend token, try to fetch the freshest user info
            if (token?.backendToken) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user`, {
                        headers: {
                            Authorization: `Bearer ${token.backendToken}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (res.ok) {
                        const backendUser = await res.json();
                        (session as any).user = backendUser;
                        (session as any).backendToken = token.backendToken;
                        return session;
                    } else if (res.status === 401) {
                        // Token expired - try to refresh using Google profile if available
                        if (session?.user?.email) {
                            try {
                                const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/social-signin`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        provider: "google",
                                        providerId: session.user.email, // Use email as fallback ID
                                        email: session.user.email,
                                        firstName: (session.user.name || '').split(' ')[0] || '',
                                        lastName: (session.user.name || '').split(' ').slice(1).join(' ') || '',
                                    }),
                                });

                                if (refreshResponse.ok) {
                                    const refreshData = await refreshResponse.json();
                                    const newToken = refreshData.Token || refreshData.token;

                                    if (newToken) {
                                        // Update the token in the JWT token for next time
                                        token.backendToken = newToken;

                                        // Fetch user data with new token
                                        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user`, {
                                            headers: {
                                                Authorization: `Bearer ${newToken}`,
                                                "Content-Type": "application/json",
                                            },
                                        });

                                        if (userRes.ok) {
                                            const refreshedUser = await userRes.json();
                                            token.backendUser = refreshedUser; // Store for fallback
                                            (session as any).user = refreshedUser;
                                            (session as any).backendToken = newToken;
                                            return session;
                                        }
                                    }
                                }
                            } catch { }
                        }

                        // If refresh failed, clear the expired token
                        token.backendToken = null;
                        (session as any).backendToken = null;
                    }
                } catch { }
            }

            // Fallback: use the backendUser persisted in the token (from signin)
            if (token.backendUser && token.backendToken) {
                (session as any).user = token.backendUser;
                (session as any).backendToken = token.backendToken;
            }

            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };