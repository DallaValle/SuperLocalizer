# Authentication Middleware

This document describes the authentication middleware implemented in SuperLocalizer to handle token expiration and 401 responses from the backend.

## Overview

The authentication system consists of two main components:

1. **Next.js Middleware** - Server-side token validation and expiration checking
2. **HTTP Client with Auth Handling** - Client-side 401 response handling

## Middleware Features

### Token Expiration Handling

The middleware automatically checks for expired JWT tokens on every request to protected routes:

- Validates token expiration using the `exp` claim
- Automatically clears NextAuth session cookies when tokens are expired
- Redirects users to the root path (`/`) when token expiration is detected

### Protected Routes

The following routes are protected and require valid authentication:
- `/home`
- `/dashboard` 
- `/properties`
- `/configuration`
- `/actions`

## HTTP Client 401 Handling

The `HttpClient` class automatically handles 401 Unauthorized responses from the backend:

1. Detects 401 status codes in API responses
2. Calls `AuthUtils.clearSessionAndRedirect()` to clean up the session
3. Redirects the user to the root path

## Usage Examples

### Using AuthUtils in Components

```typescript
import { AuthUtils } from '../utils/AuthUtils';

// In your component's error handling
try {
  const response = await PropertyService.getProperties();
  // ... handle success
} catch (error) {
  // AuthUtils will automatically handle auth errors and redirect
  await AuthUtils.handleError(error, (err) => {
    // Custom error handling for non-auth errors
    console.error('API Error:', err);
    setErrorMessage('Failed to load properties');
  });
}
```

### Manual Session Cleanup

```typescript
import { AuthUtils } from '../utils/AuthUtils';

// Manually clear session and redirect (e.g., on logout button click)
const handleLogout = async () => {
  await AuthUtils.clearSessionAndRedirect();
};
```

## Technical Implementation

### Middleware Flow

1. Extract pathname from request URL
2. Get NextAuth JWT token from request
3. Check if token exists and is not expired
4. For expired tokens:
   - Clear NextAuth session cookies
   - Redirect to root path (`/`)
5. For protected routes without valid tokens:
   - Redirect to login page with return URL
6. Handle existing authentication redirects (login page with token, etc.)

### Cookie Cleanup

When tokens are expired, the middleware clears these NextAuth cookies:
- `next-auth.session-token`
- `__Secure-next-auth.session-token`
- `next-auth.csrf-token`
- `__Host-next-auth.csrf-token`

### Error Handling Priority

The system handles authentication errors in this order:
1. Middleware catches expired tokens on page requests
2. HttpClient catches 401 responses from API calls
3. Components can use AuthUtils for custom error handling

## Configuration

### Environment Variables

Ensure these environment variables are set:

```env
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Middleware Configuration

The middleware is configured to run on all routes except:
- `/api/*` (API routes)
- `/_next/static/*` (static files)
- `/_next/image/*` (image optimization)
- `/favicon.ico`

## Security Considerations

1. **Token Validation**: Tokens are validated on both client and server side
2. **Secure Cookies**: NextAuth cookies use secure flags in production
3. **CSRF Protection**: NextAuth CSRF tokens are automatically managed
4. **No Token Storage**: Tokens are not stored in localStorage to prevent XSS attacks

## Troubleshooting

### Common Issues

1. **Infinite Redirect Loop**: Check that your API endpoints return proper 401 status codes
2. **Session Not Clearing**: Ensure NextAuth is properly configured with the same secret
3. **CORS Issues**: Verify backend CORS configuration allows your frontend domain

### Debug Mode

To debug authentication issues, check the browser's Network tab and Console for:
- 401 responses from API calls
- Redirect responses from middleware
- NextAuth cookie changes