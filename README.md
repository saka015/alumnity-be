# Alumnity Server

Backend API for the Alumnity application with secure authentication and user management.

## Features

- **Secure Authentication**: Email OTP-based authentication system
- **JWT-based Authorization**: Secure API endpoints with JWT tokens
- **User Management**: Create, update and manage user profiles
- **Password Security**: Bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/alumnity.git
cd alumnity/server
```

2. Install dependencies
```bash
npm install
```

3. Copy the environment variables file and update it with your values
```bash
cp .env.example .env
```

4. Start the development server
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/verify-otp` - Verify OTP and get access token
- `POST /api/v1/auth/resend-otp` - Resend OTP to email
- `GET /api/v1/auth/logout` - Logout and clear cookie

### User

- `GET /api/v1/user/profile` - Get user profile
- `PATCH /api/v1/user/profile` - Update user profile
- `PATCH /api/v1/user/change-password` - Change user password

## License

MIT 