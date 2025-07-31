# Google OAuth Setup Guide

## Backend Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Configuration
SESSION_SECRET=your_session_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Google OAuth Setup Steps

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type

4. **Configure OAuth Consent Screen**
   - Add your app name and description
   - Add authorized domains
   - Add scopes: `email` and `profile`

5. **Configure Authorized Redirect URIs**
   - Add: `http://localhost:5000/api/v1/auth/google/callback` (for development)
   - Add: `https://yourdomain.com/api/v1/auth/google/callback` (for production)

6. **Get Client ID and Secret**
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file

## Frontend Configuration

The frontend is already configured to handle Google OAuth. The login button will redirect users to the Google OAuth flow.

## Testing

1. Start your backend server
2. Start your frontend application
3. Go to the login page
4. Click the "Google" button
5. Complete the Google OAuth flow
6. You should be redirected back to your dashboard

## Security Notes

- Keep your Google Client Secret secure
- Use environment variables for all sensitive data
- In production, ensure your redirect URIs are properly configured
- Use HTTPS in production 