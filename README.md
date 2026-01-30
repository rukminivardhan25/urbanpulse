# 🏙️ UrbanPulse - City Services Management Platform

<div align="center">

**A comprehensive React Native mobile application built with Expo for managing city services, reporting issues, and facilitating community assistance.**

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

</div>

---

## 📱 App Builds (Expo)

### 🛠️ UrbanPulse Admin App
**Download & View Build:** [UrbanPulse Admin Build](https://expo.dev/accounts/rukminivardhan/projects/urbanpulse-admin/builds/0ab44ce8-25eb-43ab-81ad-010b62bb75d1)

### 👤 UrbanPulse Pro App (Citizen App)
**Download & View Build:** [UrbanPulse Pro Build](https://expo.dev/accounts/rukminivardhan/projects/urbanpulse-pro/builds/f01e2b5f-985f-4ed6-953d-369c8ca12e9)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#️-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#️-project-structure)
- [Development Guide](#-development-guide)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🎯 Project Overview

UrbanPulse is an innovative dual-application ecosystem designed to revolutionize city governance and citizen engagement. The platform seamlessly connects citizens with city administrators, enabling efficient issue reporting, service management, and community collaboration.

### Applications

1. **UrbanPulse Pro (Citizen App)** 📱
   - Empowers citizens to actively participate in city governance
   - Report civic issues with real-time tracking
   - Access emergency services and city information
   - Connect with community helpers and volunteers
   - Receive important city-wide alerts and notifications

2. **UrbanPulse Admin (Administrator App)** 🛠️
   - Comprehensive dashboard for city administrators
   - Manage and respond to citizen reports
   - Broadcast alerts and emergency notifications
   - Coordinate community assistance programs
   - Monitor city services and infrastructure

---

## ✨ Key Features

### 🏘️ UrbanPulse Pro (Citizen App) Features

#### 🔐 **Secure Authentication**
- **OTP-Based Phone Authentication**: Quick and secure login using phone number verification
- **No Password Required**: Eliminates password management hassles
- **Auto Account Creation**: Seamless signup for new users
- **Session Management**: Persistent login with secure JWT tokens

#### 📍 **Issue Reporting & Tracking**
- **Comprehensive Issue Reporting**: Report civic problems with detailed descriptions
- **Photo Attachments**: Add multiple photos to support your reports
- **GPS Location Tagging**: Automatically tag issues with precise location data
- **Category Classification**: Organize reports by type (potholes, garbage, water, electricity, etc.)
- **Real-Time Status Updates**: Track your reports from submission to resolution
- **Status Notifications**: Get notified when administrators update your issue status
- **Issue History**: View all your past and current reports in one place

#### 🏥 **Emergency Services Locator**
- **Nearby Hospital Finder**: Locate the nearest hospitals with distance and contact information
- **Police Station Locator**: Find nearby police stations for emergencies
- **Fire Station Locator**: Access fire department locations quickly
- **Interactive Maps**: Visual representation with turn-by-turn directions
- **One-Tap Navigation**: Open in Google Maps or Apple Maps for navigation
- **Distance Calculation**: See exact distances to emergency services

#### 🏛️ **City Services Directory**
- **Service Catalog**: Browse all available city services
- **Service Details**: View schedules, contact information, and requirements
- **Service Categories**: Organized by type (utilities, permits, registrations, etc.)
- **Location-Based Services**: Filter services available in your area
- **Quick Access**: Direct contact and navigation to service centers

#### 🤝 **Community Help Network**
- **Help Request System**: Create requests for community assistance
- **Helper Discovery**: Find volunteers offering help in your area
- **Offer Help**: Volunteer to assist fellow citizens
- **Request Categories**: Organize by type (transportation, food, medical, etc.)
- **Real-Time Matching**: Connect requesters with available helpers
- **Request Tracking**: Monitor the status of your help requests

#### 💬 **Real-Time Communication**
- **In-App Chat System**: Direct messaging with helpers and administrators
- **Chat History**: Persistent conversation history
- **Notification Alerts**: Get notified of new messages
- **Multi-Party Chats**: Communicate with multiple participants
- **File Sharing**: Share images and documents in chats

#### 📢 **Alerts & Notifications**
- **City-Wide Alerts**: Receive important announcements from city administration
- **Emergency Notifications**: Critical alerts for emergencies and disasters
- **Service Updates**: Notifications about service changes or maintenance
- **Push Notifications**: Real-time alerts even when app is closed
- **Alert Categories**: Filter by importance and type

#### 🤖 **AI Chat Assistant**
- **24/7 AI Support**: Get instant answers to your questions
- **Service Information**: Ask about city services and procedures
- **Issue Guidance**: Get help with reporting issues
- **Natural Language Processing**: Understand questions in natural language
- **Contextual Responses**: Intelligent responses based on your location and history

#### 🌍 **Multi-Language Support**
- **English**: Full support for English language
- **Hindi (हिंदी)**: Complete Hindi translation
- **Telugu (తెలుగు)**: Full Telugu language support
- **Easy Language Switching**: Change language anytime from settings
- **Localized Content**: All app content translated

#### 📍 **Advanced Location Services**
- **GPS Integration**: Accurate location detection
- **Interactive Map Selection**: Visual location picker with drag-and-drop
- **Address Autocomplete**: Smart address suggestions
- **Reverse Geocoding**: Convert coordinates to readable addresses
- **Location History**: Save frequently used locations
- **Multi-Level Location**: City, area, mandal, district, state, pincode support

#### 📊 **Dashboard & Analytics**
- **Personal Dashboard**: Overview of your activity and reports
- **Statistics**: Track your contribution to city improvement
- **Quick Actions**: Fast access to common features
- **Recent Activity**: View your recent reports and interactions

---

### 🛠️ UrbanPulse Admin (Administrator App) Features

#### 🔐 **Admin Authentication**
- **Secure Admin Login**: Separate authentication system for administrators
- **OTP Verification**: Phone-based verification for admin accounts
- **Role-Based Access**: Different permission levels for different admin roles
- **Session Security**: Secure token-based authentication

#### 📊 **Comprehensive Dashboard**
- **Real-Time Statistics**: Overview of active reports, services, and requests
- **Issue Metrics**: Track pending, in-progress, and resolved issues
- **Service Analytics**: Monitor service usage and performance
- **Request Statistics**: View help request trends and patterns
- **Quick Actions**: Fast access to common administrative tasks
- **Visual Charts**: Graphical representation of data

#### 📝 **Issue Management System**
- **All Reports View**: See all citizen reports in one place
- **Filter & Search**: Find specific reports by category, status, or location
- **Status Management**: Update issue status (pending, in-progress, resolved, closed)
- **Priority Assignment**: Mark issues by urgency level
- **Bulk Actions**: Process multiple issues simultaneously
- **Report Details**: View complete information including photos and location
- **Assignment System**: Assign issues to specific team members
- **Resolution Tracking**: Track time to resolution and efficiency metrics

#### 🏛️ **Service Management**
- **Create Services**: Add new city services with complete details
- **Edit Services**: Update service information, schedules, and requirements
- **Delete Services**: Remove outdated or discontinued services
- **Service Categories**: Organize services by type and location
- **Schedule Management**: Set service availability and timings
- **Contact Information**: Manage service center contact details
- **Location Mapping**: Associate services with specific locations

#### 📢 **Alert Broadcasting System**
- **Create Alerts**: Compose city-wide alerts and announcements
- **Targeted Broadcasting**: Send alerts to specific areas or city-wide
- **Alert Types**: Emergency, informational, service updates
- **Rich Content**: Include images, links, and detailed descriptions
- **Scheduled Alerts**: Schedule alerts for future delivery
- **Alert History**: View all sent alerts and their reach
- **Priority Levels**: Set alert importance (low, medium, high, critical)

#### 🤝 **Help Request Management**
- **Request Overview**: View all community help requests
- **Request Details**: See complete request information
- **Status Updates**: Track request fulfillment status
- **Helper Matching**: Monitor helper-requester connections
- **Request Analytics**: Analyze help request patterns
- **Intervention Tools**: Step in when needed to coordinate assistance

#### 💬 **Communication Management**
- **User Communication**: Chat directly with citizens
- **Helper Coordination**: Communicate with community helpers
- **Group Messaging**: Send messages to multiple users
- **Message History**: Access all conversation records
- **Notification Management**: Control notification preferences

#### 📍 **Location Management**
- **Assigned Locations**: Manage administrative areas of responsibility
- **Map-Based Selection**: Use interactive maps to define coverage areas
- **Multi-Location Support**: Handle multiple administrative zones
- **Location Hierarchy**: Manage city, district, and area assignments
- **Boundary Definition**: Set precise geographic boundaries

#### 📈 **Reporting & Analytics**
- **Performance Metrics**: Track response times and resolution rates
- **Trend Analysis**: Identify patterns in issues and requests
- **Service Usage Reports**: Analyze which services are most used
- **Geographic Insights**: Understand issue distribution across areas
- **Export Capabilities**: Export data for external analysis

---

## 🛠️ Technology Stack

### Frontend (React Native + Expo)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.81.5 | Mobile app framework |
| **Expo SDK** | 54 | Development platform and tooling |
| **React Navigation** | 6.x | Navigation and routing |
| **React Context API** | Built-in | State management |
| **Lucide React Native** | Latest | Icon library |
| **React Native WebView** | Latest | Map integration |
| **Leaflet.js** | Latest | Interactive maps |
| **Expo Location** | Latest | GPS and location services |
| **AsyncStorage** | Latest | Local data persistence |
| **Expo Notifications** | Latest | Push notifications |

### Backend (Node.js + Express)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 16+ | Runtime environment |
| **Express.js** | Latest | Web framework |
| **MongoDB** | Latest | Database |
| **Mongoose** | Latest | ODM (Object Data Modeling) |
| **JWT** | Latest | Authentication tokens |
| **bcryptjs** | Latest | Password/OTP hashing |
| **Fast2SMS API** | Latest | SMS OTP delivery |
| **Express Rate Limit** | Latest | API rate limiting |
| **Node Cache** | Latest | In-memory OTP storage |
| **CORS** | Latest | Cross-origin resource sharing |

---

## 📦 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Fast2SMS Account** (optional) - For SMS OTP delivery, or use MOCK_OTP mode for development

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd urbanpulse-main
```

### Step 2: Install Main App Dependencies

```bash
npm install
```

### Step 3: Install Admin App Dependencies

```bash
cd admin-role
npm install
cd ..
```

### Step 4: Setup Main Backend

```bash
cd backend
npm install
```

Create `backend/.env` file:

```env
# Server Configuration
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/urbanpulse
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanpulse

# Fast2SMS Configuration (Optional - for production)
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_ROUTE=q

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60

# Development Mode
MOCK_OTP=true  # Set to true to accept any OTP (for testing)
```

### Step 5: Setup Admin Backend

```bash
cd admin-role/backend
npm install
```

Create `admin-role/backend/.env` file:

```env
# Server Configuration
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/urbanpulse
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanpulse

# Fast2SMS Configuration (Optional - for production)
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_ROUTE=q

# JWT Configuration
JWT_SECRET=your-admin-secret-key-change-in-production
ADMIN_JWT_SECRET=your-admin-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60

# Development Mode
MOCK_OTP=true  # Set to true to accept any OTP (for testing)
```

---

## 🚀 Running the Application

### Start Main Backend Server

```bash
cd backend
npm run dev
```

✅ Server will run on `http://localhost:3000`

### Start Admin Backend Server

```bash
cd admin-role/backend
npm run dev
```

✅ Server will run on `http://localhost:3001`

### Start Main Mobile App (UrbanPulse Pro)

```bash
# From root directory
npm start
```

Then choose your preferred method:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with **Expo Go** app on your phone

### Start Admin Mobile App (UrbanPulse Admin)

```bash
cd admin-role
npm start
```

Then choose your preferred method:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with **Expo Go** app on your phone

---

## 🔑 Environment Variables

### Main Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | `3000` |
| `MONGODB_URI` | MongoDB connection string | **Yes** | - |
| `FAST2SMS_API_KEY` | Fast2SMS API key for OTP | No | - |
| `FAST2SMS_ROUTE` | Fast2SMS route type | No | `q` |
| `JWT_SECRET` | Secret for JWT token signing | **Yes** | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | `7d` |
| `OTP_EXPIRY_MINUTES` | OTP validity duration | No | `5` |
| `OTP_RESEND_COOLDOWN_SECONDS` | Cooldown between OTP resends | No | `60` |
| `MOCK_OTP` | Enable mock OTP mode | No | `false` |

### Admin Backend (.env)

Same as main backend, but uses:
- `PORT=3001` (different port)
- `ADMIN_JWT_SECRET` (separate secret for admin tokens)

---

## 📡 API Documentation

### Main Backend API (Port 3000)

#### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/send-otp` | Send OTP to phone number |
| `POST` | `/auth/verify-otp` | Verify OTP and login/signup |

#### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/me` | Get current user profile |
| `PUT` | `/users/me` | Update user profile |
| `PUT` | `/users/location` | Update user location |

#### Issue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/issues` | Create new issue report |
| `GET` | `/issues` | Get user's issues |
| `GET` | `/issues/:id` | Get issue details |
| `PUT` | `/issues/:id` | Update issue |

#### Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/services` | Get all city services |
| `GET` | `/services/:id` | Get service details |

#### Help Request Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/requests` | Create help request |
| `GET` | `/requests` | Get all requests |
| `GET` | `/requests/:id` | Get request details |
| `PUT` | `/requests/:id` | Update request |
| `DELETE` | `/requests/:id` | Cancel request |

#### Helper Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/helpers` | Get available helpers |
| `POST` | `/helpers/offer` | Offer help |
| `GET` | `/helpers/offers` | Get my offers |

#### Message Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/messages` | Send message |
| `GET` | `/messages/:chatId` | Get chat messages |

#### Alert Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/alerts` | Get city alerts |

### Admin Backend API (Port 3001)

#### Admin Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/send-otp` | Send OTP to admin phone |
| `POST` | `/admin/verify-otp` | Verify OTP and login/signup |
| `GET` | `/admin/me` | Get current admin profile |
| `GET` | `/admin/check-exists` | Check if admin exists |

#### Admin Issue Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/issues` | Get all issues |
| `GET` | `/admin/issues/:id` | Get issue details |
| `PUT` | `/admin/issues/:id` | Update issue status |

#### Admin Service Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/services` | Create service |
| `GET` | `/admin/services` | Get all services |
| `PUT` | `/admin/services/:id` | Update service |
| `DELETE` | `/admin/services/:id` | Delete service |

#### Admin Alert Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/alerts` | Create alert |
| `GET` | `/admin/alerts` | Get all alerts |

#### Admin Request Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/requests` | Get all help requests |
| `GET` | `/admin/requests/:id` | Get request details |

---

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

---

## 🔐 Authentication Flow

### User Authentication Process

1. **Phone Number Entry**: User enters phone number with country code (e.g., `+919876543210`)
2. **OTP Generation**: Backend generates a secure 6-digit OTP
3. **OTP Delivery**: 
   - If `MOCK_OTP=false`: OTP sent via Fast2SMS API
   - If `MOCK_OTP=true`: OTP displayed in console (for development)
4. **OTP Verification**: User enters received OTP
5. **Validation**: 
   - If `MOCK_OTP=true`: Any 6-digit OTP is accepted
   - If `MOCK_OTP=false`: Only the generated OTP is accepted
6. **Account Creation/Login**: 
   - New users: Account automatically created
   - Existing users: Logged in
7. **Token Generation**: JWT token returned for authenticated requests
8. **Session Management**: Token stored securely for subsequent API calls

### Admin Authentication Process

Same flow as user authentication, but uses:
- Separate admin backend (port 3001)
- Separate admin database models
- Different JWT secret (`ADMIN_JWT_SECRET`)

---

## 🗄️ Database Models

### User App Models

- **User**: Name, phone number, location details (city, area, mandal, district, state, pincode), profile information
- **Issue**: Title, description, category, location coordinates, status, images, reporter reference, timestamps
- **Service**: Name, description, schedule, type, location, contact information
- **Request**: Title, description, category, location, requester reference, helper reference, status
- **Helper**: User reference, help offers, availability status, ratings
- **Message**: Chat messages between users, helpers, and administrators with timestamps
- **Alert**: City-wide alerts with title, description, priority, target areas, timestamps

### Admin App Models

- **Admin**: Name, phone number, location, role, active status, permissions
- **AdminIssue**: Same as user issues with admin associations and assignment tracking
- **AdminService**: Service management with admin creation/modification tracking
- **AdminAlert**: Alert creation and broadcasting with admin tracking

---

## 📱 Key Screens

### UrbanPulse Pro (Citizen App) Screens

| Screen | Description |
|--------|-------------|
| **LandingScreen** | Welcome screen with app introduction and features |
| **SigninScreen / SignupScreen** | Phone-based authentication with OTP verification |
| **DashboardScreen** | Main dashboard with services, alerts, nearby help, quick actions |
| **ReportIssueScreen** | Comprehensive issue reporting with photo upload and location tagging |
| **ComplaintTrackingScreen** | Track all reported issues with real-time status updates |
| **ServicesScreen** | Browse and access all city services |
| **EmergencyServicesScreen** | Find nearby hospitals, police stations, and fire stations |
| **MapScreen** | Interactive map with directions and navigation |
| **HelpRequestsScreen** | Create and browse community help requests |
| **HelpersListScreen** | View available helpers and their offers |
| **ChatScreen** | Real-time messaging with helpers and administrators |
| **ProfileScreen** | User profile, settings, and preferences |
| **LocationSelectionScreen** | Interactive map-based location selection |

### UrbanPulse Admin (Administrator App) Screens

| Screen | Description |
|--------|-------------|
| **AdminLandingScreen** | Admin welcome and app overview |
| **AdminSigninScreen / AdminSignupScreen** | Admin authentication with OTP |
| **AdminDashboardScreen** | Comprehensive dashboard with statistics and metrics |
| **ViewReportsScreen** | Manage and respond to all citizen issue reports |
| **ManageServicesScreen** | Create, edit, and delete city services |
| **SendAlertsScreen** | Create and broadcast city-wide alerts |
| **AdminChatScreen** | Communicate with citizens and helpers |
| **AdminProfileScreen** | Admin profile and account settings |
| **AdminLocationSelectionScreen** | Map-based location management for assigned areas |

---

## 🗺️ Map Integration

The app uses **OpenStreetMap** with **Leaflet.js** via React Native WebView for comprehensive mapping functionality.

### Map Features

- **Interactive Location Selection**: Click or drag marker to select precise locations
- **GPS Integration**: Get current location with one tap
- **Reverse Geocoding**: Convert coordinates to readable addresses automatically
- **Navigation Integration**: Open in Google Maps or Apple Maps for turn-by-turn directions
- **Distance Calculation**: Calculate exact distances between locations
- **Nearby Services**: Visual representation of nearby emergency services
- **Multiple Markers**: Display multiple points of interest simultaneously
- **Zoom & Pan**: Full map interaction with pinch-to-zoom and pan gestures

### Use Cases

- **Issue Reporting**: Tag issues with precise GPS coordinates
- **Emergency Services**: Find and navigate to nearest hospitals, police, fire stations
- **Location Selection**: Choose locations for help requests and service access
- **Service Centers**: Locate city service centers and offices

---

## 🌐 Multi-Language Support

UrbanPulse supports multiple languages to serve diverse communities:

- **English (en)**: Default language with complete translation
- **Hindi (हिंदी)**: Full Hindi language support
- **Telugu (తెలుగు)**: Complete Telugu translation

### Language Features

- **Easy Switching**: Change language anytime from app settings
- **Complete Localization**: All UI elements, messages, and content translated
- **Persistent Selection**: Language preference saved across app sessions
- **Context-Aware**: Location-specific translations where applicable

---

## 🔧 Development Features

### MOCK_OTP Mode

When `MOCK_OTP=true` in backend `.env`:

- ✅ **Any 6-digit OTP accepted** (e.g., "123456", "000000", "999999")
- ✅ **OTP expiry checks skipped** - No time-based validation
- ✅ **Brute force protection disabled** - Unlimited verification attempts
- ✅ **No SMS required** - Perfect for development and testing
- ✅ **Console logging** - OTP values displayed in backend console
- ⚠️ **Warning displayed**: `⚠️ MOCK OTP MODE ENABLED`

**Use Case**: Ideal for development, testing, and demos without SMS service costs.

### Development Mode Features

- **Console OTP Display**: OTP shown in console when Fast2SMS fails or in MOCK mode
- **Request/Response Logging**: Detailed API request and response logging
- **Error Messages**: Comprehensive error messages for debugging
- **Hot Reload**: Automatic app refresh on code changes
- **Development Tools**: React Native debugger and Expo DevTools support

---

## 📝 Important Notes

### Phone Number Format
- **Required Format**: Must include country code
- **Example**: `+919876543210` (India), `+1234567890` (USA)
- **Validation**: Backend validates phone number format

### Location Data Requirements
- **Complete Location**: Users and admins must provide full location details
- **Hierarchy**: City → Area → Mandal → District → State → Pincode
- **GPS Coordinates**: Automatically captured for precise location

### Fast2SMS Integration
- **Optional**: Can be disabled using `MOCK_OTP=true`
- **Production**: Required for production deployments
- **Cost**: SMS charges apply per OTP sent

### Database Options
- **Local MongoDB**: Use local MongoDB instance
- **MongoDB Atlas**: Cloud-hosted MongoDB (recommended for production)
- **Connection String**: Configure in `.env` file

### Port Configuration
- **Main Backend**: Port `3000` (user app)
- **Admin Backend**: Port `3001` (admin app)
- **Change if needed**: Update `PORT` in respective `.env` files

### Security Considerations
- **JWT Tokens**: Expire after 7 days (configurable)
- **OTP Storage**: In-memory only (Node Cache), not persistent
- **Rate Limiting**: API requests rate-limited to prevent abuse
- **Secrets**: Change default JWT secrets in production

---

## 🐛 Troubleshooting

### Backend Not Starting

**Problem**: Backend server fails to start

**Solutions**:
- ✅ Check MongoDB connection string in `.env`
- ✅ Verify MongoDB is running (local) or accessible (Atlas)
- ✅ Ensure ports 3000/3001 are not in use by other applications
- ✅ Check `.env` file exists and has correct values
- ✅ Verify Node.js version (v16 or higher)
- ✅ Check for syntax errors in `.env` file

### OTP Not Received

**Problem**: OTP SMS not received on phone

**Solutions**:
- ✅ Enable `MOCK_OTP=true` for testing (accepts any 6-digit OTP)
- ✅ Check Fast2SMS API key and account balance
- ✅ Verify phone number format includes country code
- ✅ Check backend console for OTP value (displayed in development)
- ✅ Verify Fast2SMS service status
- ✅ Check phone number is valid and can receive SMS

### Location Services Not Working

**Problem**: GPS location not detected or inaccurate

**Solutions**:
- ✅ Grant location permissions when prompted
- ✅ Enable location services in device settings
- ✅ Check `app.json` permissions configuration
- ✅ Verify device has GPS capability
- ✅ Try in open area for better GPS signal
- ✅ Check if location services are enabled system-wide

### Map Not Loading

**Problem**: Maps not displaying or loading slowly

**Solutions**:
- ✅ Ensure active internet connection
- ✅ Check OpenStreetMap tile server availability
- ✅ Verify WebView permissions in app configuration
- ✅ Clear app cache and restart
- ✅ Check device storage space
- ✅ Try on different network (WiFi vs mobile data)

### Database Connection Issues

**Problem**: Cannot connect to MongoDB

**Solutions**:
- ✅ Verify MongoDB is running (for local installation)
- ✅ Check MongoDB connection string format
- ✅ Verify network access (for MongoDB Atlas)
- ✅ Check firewall settings
- ✅ Verify MongoDB credentials
- ✅ Test connection using MongoDB Compass or CLI

### Build Issues

**Problem**: Expo build fails or app won't start

**Solutions**:
- ✅ Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- ✅ Clear Expo cache: `expo start -c`
- ✅ Check Node.js and npm versions
- ✅ Verify all dependencies are installed
- ✅ Check for conflicting package versions
- ✅ Review error messages in terminal

---

## 📄 License

This project is proprietary and confidential.

**Copyright © 2024 rukminivardhan**

All rights reserved. This software and associated documentation files (the "Software") are the proprietary property of rukminivardhan. Unauthorized copying, modification, distribution, or use of this Software, via any medium, is strictly prohibited without express written permission.

---

## 👥 Contributors

**UrbanPulse Development Team**

- **rukminivardhan** - Project Lead & Developer

---

<div align="center">

**Version**: 1.0.0  
**Last Updated**: 2024

Made with ❤️ for better city governance

</div>
