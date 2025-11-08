# NextAuth with Google OAuth Setup Instructions

This project has been updated to use NextAuth for authentication with Google OAuth support.

## Environment Setup

1. Copy the example environment file:
```bash
cp frontend/.env.local.example frontend/.env.local
```

2. Configure the following environment variables in `frontend/.env.local`:

### NextAuth Configuration
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

### Google OAuth Configuration
To enable Google login, you'll need to:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 client ID
5. Add these authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

Then add your credentials:
```
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
```

### Backend API Configuration
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Features

- **Traditional Login**: Username/password authentication via your .NET backend
- **Google OAuth**: Social login with Google that syncs user data to your backend
- **Session Management**: Automatic session handling with NextAuth
- **Token Integration**: Backend JWT tokens are stored in NextAuth session for API calls

## How it works

1. **Google Login Flow**:
   - User clicks "Continue with Google"
   - NextAuth handles OAuth with Google
   - Upon success, NextAuth calls your backend `/auth/social-signin` endpoint
   - Backend creates/updates user and returns JWT token
   - Token is stored in NextAuth session for subsequent API calls

2. **Traditional Login Flow**:
   - User enters username/password
   - NextAuth calls your backend `/auth/signin` endpoint
   - Backend validates credentials and returns JWT token
   - Token is stored in NextAuth session

3. **Session Access**:
   - Components can use `useAuth()` hook to access user data and token
   - API calls automatically include the backend token for authentication

## Testing

1. Start your .NET backend (port 5000)
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000/login`
4. Test both login methods:
   - Traditional: Use your existing username/password
   - Google: Click "Continue with Google" (requires Google OAuth setup)

## Notes

- The backend social-signin endpoint expects Google profile data and returns user + token
- All existing pages that use `useAuth()` have been updated for the new interface
- Session data persists across browser sessions for 7 days
- In production, make sure to set a secure `NEXTAUTH_SECRET`