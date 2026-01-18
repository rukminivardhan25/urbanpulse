# UrbanPulse - City Services Management Platform

A comprehensive React Native mobile application built with Expo for managing city services, reporting issues, and facilitating community assistance. The platform includes separate applications for citizens and city administrators.

## 📱 Project Overview

UrbanPulse is a dual-application system designed to bridge the gap between citizens and city administrators:

1. **Main Mobile App (User App)**: For citizens to report issues, access city services, request help, and stay informed
2. **Admin Mobile App**: For city administrators to manage services, respond to reports, send alerts, and coordinate assistance

## 🏗️ Project Structure

```
urbanpulse-main/
├── backend/                    # Main backend API (User app backend)
│   ├── config/                 # Database configuration
│   ├── controllers/            # Request handlers
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic services
│   ├── middleware/             # Express middleware
│   ├── server.js               # Main server file
│   └── .env                    # Environment variables
│
├── admin-role/                 # Admin mobile app
│   ├── backend/                # Admin backend API
│   │   ├── config/             # Database configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic services
│   │   ├── server.js           # Main server file
│   │   └── .env                # Environment variables
│   ├── screens/                # Admin app screens
│   ├── components/             # Reusable components
│   ├── navigation/             # Navigation setup
│   ├── utils/                  # Utility functions
│   └── contexts/               # React contexts
│
├── screens/                    # Main app screens
├── components/                 # Reusable components
├── navigation/                 # Navigation setup
├── utils/                      # Utility functions
├── contexts/                   # React contexts
├── constants/                  # Constants and theme
└── package.json                # Main app dependencies
```

## 🚀 Features

### User App Features
- **Authentication**: OTP-based phone number authentication
- **Issue Reporting**: Report city issues with location, photos, and descriptions
- **Issue Tracking**: Track status of reported issues in real-time
- **City Services**: View and access various city services
- **Emergency Services**: Find nearby hospitals, police stations, and fire stations with map integration
- **Help Requests**: Create and manage help requests for community assistance
- **Helpers Network**: Connect with volunteers offering help
- **Alerts & Notifications**: Receive city-wide alerts and updates
- **Chat System**: Real-time chat with helpers and administrators
- **Multi-language Support**: Support for multiple languages (English, Hindi, Telugu)
- **Location Services**: GPS-based location selection and map integration
- **AI Chat Assistant**: AI-powered assistance for users

### Admin App Features
- **Admin Authentication**: Secure admin login with OTP verification
- **Dashboard**: Overview of active reports, services, and statistics
- **Issue Management**: View, manage, and update issue statuses
- **Service Management**: Create and manage city services
- **Alert Broadcasting**: Send city-wide alerts to citizens
- **Request Management**: Handle help requests from citizens
- **Chat Management**: Communicate with users and helpers
- **Location Management**: Manage assigned locations with map selection

## 🛠️ Technology Stack

### Frontend (React Native + Expo)
- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **UI Components**: Lucide React Native icons
- **Maps**: React Native WebView with Leaflet.js (OpenStreetMap)
- **Location**: Expo Location API
- **Storage**: AsyncStorage for local data

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, bcryptjs for OTP hashing
- **SMS Service**: Fast2SMS API for OTP delivery
- **Rate Limiting**: Express Rate Limit
- **Caching**: Node Cache for OTP storage

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas cloud)
- Fast2SMS account (for SMS OTP) - optional with MOCK_OTP mode
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd urbanpulse-main
```

### 2. Install Main App Dependencies
```bash
npm install
```

### 3. Install Admin App Dependencies
```bash
cd admin-role
npm install
cd ..
```

### 4. Setup Main Backend
```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/urbanpulse
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanpulse

# Fast2SMS Configuration (Optional)
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_ROUTE=q

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60

# MOCK OTP Mode (for development/testing)
MOCK_OTP=true  # Set to true to accept any OTP
```

### 5. Setup Admin Backend
```bash
cd admin-role/backend
npm install
```

Create `admin-role/backend/.env` file:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/urbanpulse
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanpulse

# Fast2SMS Configuration (Optional)
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_ROUTE=q

# JWT Configuration
JWT_SECRET=your-admin-secret-key-change-in-production
ADMIN_JWT_SECRET=your-admin-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60

# MOCK OTP Mode (for development/testing)
MOCK_OTP=true  # Set to true to accept any OTP
```

## 🚀 Running the Application

### Start Main Backend
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:3000`

### Start Admin Backend
```bash
cd admin-role/backend
npm run dev
```
Server will run on `http://localhost:3001`

### Start Main Mobile App
```bash
# From root directory
npm start
```
Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

### Start Admin Mobile App
```bash
cd admin-role
npm start
```
Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

## 🔑 Environment Variables

### Main Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `FAST2SMS_API_KEY` | Fast2SMS API key for OTP | No (optional) |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `OTP_EXPIRY_MINUTES` | OTP validity duration | No (default: 5) |
| `OTP_RESEND_COOLDOWN_SECONDS` | Cooldown between resends | No (default: 60) |
| `MOCK_OTP` | Enable mock OTP mode | No (default: false) |

### Admin Backend (.env)
Same as main backend, but uses `PORT=3001` and `ADMIN_JWT_SECRET` for admin-specific tokens.

## 📡 API Endpoints

### Main Backend (Port 3000)

#### Authentication
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and login/signup

#### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile
- `PUT /users/location` - Update user location

#### Issues
- `POST /issues` - Create new issue report
- `GET /issues` - Get user's issues
- `GET /issues/:id` - Get issue details
- `PUT /issues/:id` - Update issue

#### Services
- `GET /services` - Get all city services
- `GET /services/:id` - Get service details

#### Requests (Help Requests)
- `POST /requests` - Create help request
- `GET /requests` - Get all requests
- `GET /requests/:id` - Get request details
- `PUT /requests/:id` - Update request
- `DELETE /requests/:id` - Cancel request

#### Helpers
- `GET /helpers` - Get available helpers
- `POST /helpers/offer` - Offer help
- `GET /helpers/offers` - Get my offers

#### Messages
- `POST /messages` - Send message
- `GET /messages/:chatId` - Get chat messages

#### Alerts
- `GET /alerts` - Get city alerts

### Admin Backend (Port 3001)

#### Admin Authentication
- `POST /admin/send-otp` - Send OTP to admin phone
- `POST /admin/verify-otp` - Verify OTP and login/signup
- `GET /admin/me` - Get current admin profile
- `GET /admin/check-exists` - Check if admin exists

#### Admin Issues
- `GET /admin/issues` - Get all issues
- `GET /admin/issues/:id` - Get issue details
- `PUT /admin/issues/:id` - Update issue status

#### Admin Services
- `POST /admin/services` - Create service
- `GET /admin/services` - Get all services
- `PUT /admin/services/:id` - Update service
- `DELETE /admin/services/:id` - Delete service

#### Admin Alerts
- `POST /admin/alerts` - Create alert
- `GET /admin/alerts` - Get all alerts

#### Admin Requests
- `GET /admin/requests` - Get all help requests
- `GET /admin/requests/:id` - Get request details

## 🔐 Authentication Flow

### User Authentication
1. User enters phone number
2. Backend generates 6-digit OTP
3. OTP sent via Fast2SMS (or shown in console if MOCK_OTP=true)
4. User enters OTP
5. Backend verifies OTP:
   - If `MOCK_OTP=true`: Any 6-digit OTP is accepted
   - If `MOCK_OTP=false`: Only the generated OTP is accepted
6. User created/logged in
7. JWT token returned for subsequent requests

### Admin Authentication
Same flow as user authentication, but uses separate admin backend and database models.

## 🗄️ Database Models

### User Models
- **User**: Name, phone, location (city, area, mandal, district, state, pincode)
- **Issue**: Title, description, category, location, status, images, reporter
- **Service**: Name, description, schedule, type, location
- **Request**: Title, description, category, location, requester, helper
- **Helper**: User reference, offers, availability
- **Message**: Chat messages between users and helpers/admins
- **Alert**: City-wide alerts and notifications

### Admin Models
- **Admin**: Name, phone, location, role, active status
- Same issue/service/request models with admin associations

## 📱 Key Screens

### User App Screens
- **LandingScreen**: Welcome and app introduction
- **SigninScreen / SignupScreen**: Authentication
- **DashboardScreen**: Main dashboard with services, alerts, nearby help
- **ReportIssueScreen**: Report city issues
- **ComplaintTrackingScreen**: Track reported issues
- **ServicesScreen**: View city services
- **EmergencyServicesScreen**: Find nearby emergency services
- **MapScreen**: Interactive map with directions
- **HelpRequestsScreen**: Community help requests
- **HelpersListScreen**: Available helpers
- **ChatScreen**: Real-time messaging
- **ProfileScreen**: User profile and settings
- **LocationSelectionScreen**: Location selection with map

### Admin App Screens
- **AdminLandingScreen**: Admin welcome
- **AdminSigninScreen / AdminSignupScreen**: Admin authentication
- **AdminDashboardScreen**: Admin dashboard with statistics
- **ViewReportsScreen**: Manage issue reports
- **ManageServicesScreen**: Manage city services
- **SendAlertsScreen**: Create and send alerts
- **AdminChatScreen**: Chat with users
- **AdminProfileScreen**: Admin profile
- **AdminLocationSelectionScreen**: Location selection with map

## 🗺️ Map Integration

The app uses **OpenStreetMap** with **Leaflet.js** via React Native WebView:

- **Nearby Services**: Find hospitals, police stations, fire stations
- **Location Selection**: Interactive map for selecting locations
- **GPS Navigation**: Open native maps app for turn-by-turn directions
- **Distance Calculation**: Calculate distances between locations

### Map Features
- Click or drag marker to select location
- Get current GPS location
- Reverse geocoding for address
- Open in Google Maps/Apple Maps for navigation

## 🌐 Multi-language Support

Supported languages:
- English (en)
- Hindi (hi)
- Telugu (te)

Language switching available in the app settings.

## 🔧 Development Features

### MOCK_OTP Mode
When `MOCK_OTP=true` in backend `.env`:
- Any 6-digit OTP is accepted (e.g., "123456", "000000")
- OTP expiry checks are skipped
- Brute force protection is disabled
- Users can test without SMS service
- Console shows: `⚠️ MOCK OTP MODE ENABLED`

### Development Mode
- OTP shown in console when Fast2SMS fails
- Request/response logging enabled
- Detailed error messages
- Hot reload enabled

## 📝 Important Notes

1. **Phone Number Format**: Must include country code (e.g., `+919876543210`)
2. **Location Data**: User and admin must provide complete location details
3. **Fast2SMS**: Optional for development (use MOCK_OTP mode)
4. **MongoDB**: Can use local MongoDB or MongoDB Atlas (cloud)
5. **Ports**: Main backend uses 3000, Admin backend uses 3001
6. **JWT Tokens**: Tokens expire after 30 days
7. **OTP Storage**: OTPs stored in-memory (Node Cache), not persistent
8. **Rate Limiting**: API requests are rate-limited to prevent abuse

## 🐛 Troubleshooting

### Backend not starting
- Check MongoDB connection
- Verify `.env` file exists and has correct values
- Check if ports 3000/3001 are available

### OTP not received
- Check Fast2SMS API key and balance
- Enable `MOCK_OTP=true` for testing
- Check backend console for OTP value

### Location not working
- Grant location permissions on device
- Enable location services in device settings
- Check app.json permissions configuration

### Map not loading
- Ensure internet connection
- Check OpenStreetMap tile server availability
- Verify WebView permissions

## 📄 License

This project is proprietary and confidential.

## 👥 Contributors

UrbanPulse Development Team

---

**Version**: 1.0.0  
**Last Updated**: 2024

