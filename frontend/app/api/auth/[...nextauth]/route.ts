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
                    // Direct fetch to backend without using AuthService (which uses localStorage)
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
                        console.log("Authorize response:", data);
                        if (data?.token) {
                            // Decode JWT token to extract user information
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
                            } catch (jwtError) {
                                console.error("Failed to decode JWT token:", jwtError);
                                return null;
                            }
                        }
                    } else {
                        console.error("Backend authentication failed:", await response.text());
                    }
                    return null;
                } catch (error) {
                    console.error("Authentication error:", error);
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
                    // Call your .NET backend social-signin endpoint
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
                        const backendUser = await response.json();
                        // Store backend user data in user object
                        (user as any).backendUser = backendUser.user;
                        (user as any).backendToken = backendUser.token;
                        return true;
                    } else {
                        console.error("Backend social signin failed:", await response.text());
                        return false;
                    }
                } catch (error) {
                    console.error("Error during social signin:", error);
                    return false;
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            // Persist the user data and backend token to the JWT token
            if (user) {
                token.backendUser = (user as any).backendUser;
                token.backendToken = (user as any).backendToken;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            // If we have a backend token, try to fetch the freshest user info
            try {
                if (token?.backendToken) {
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
                    }
                    // If the fetch failed, fall back to token-stored user
                }
            } catch (err) {
                console.error('Error refreshing backend user in session callback:', err);
            }

            // Fallback: use the backendUser persisted in the token (from signin)
            if (token.backendUser) {
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