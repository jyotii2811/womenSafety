# 🛡️ Women Safety Web Application

A comprehensive, full-stack **Women Safety & Emergency Response Web Application** built using the MERN stack (MongoDB, Express.js, React, Node.js). This platform empowers women with real-time emergency tools including one-click SOS alerts, voice-activated distress triggers, live GPS tracking, panic siren, fake phone call simulator, emergency contact management, and a centralized Admin Command Center.

---

## 🛠️ Project Tech Stack Overview

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite 8 | Fast SPA rendering & interactive UI components |
| **Frontend Routing** | React Router DOM v7 | Client-side routing & Protected Routes |
| **Styling & UI** | Modern Vanilla CSS | Custom dark/glassmorphic theme & responsive layouts |
| **State & Notifications**| React Context API + React Hot Toast | Global authentication state & real-time toast alerts |
| **Icons & UI Assets** | React Icons (`react-icons`) | Sleek vector icons for UI elements |
| **Backend Framework** | Node.js + Express.js | RESTful API server & request routing |
| **Database** | MongoDB + Mongoose ORM | NoSQL database for users, SOS alerts, contacts & logs |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | Secure session tokens & password hashing |
| **Email Dispatch** | Nodemailer & EmailJS (`@emailjs/browser`)| Automated email alerts with live location links |
| **Browser Web APIs** | Geolocation API, Web Speech API, Web Audio API | Live GPS tracking, Voice SOS recognition, Panic Siren |

---

## ✨ Features & Technology Breakdown (Har Feature ke liye Konsi Tech Use Hui H)

Here is the complete list of features implemented in this project and the exact technologies used for each:

### 1. 🚨 One-Click SOS Emergency Button
- **Description**: Triggers an instant emergency SOS alert. Automatically captures the user's current GPS location, generates a Google Maps link, logs the alert in the database, and sends email notifications to trusted emergency contacts.
- **Tech Used**:
  - **Frontend**: React State Management ([`SOSPage.jsx`](file:///c:/Women-Safety/Frontend/src/pages/SOSPage.jsx), [`Dashboard.jsx`](file:///c:/Women-Safety/Frontend/src/pages/Dashboard.jsx)), Axios
  - **Browser API**: HTML5 Geolocation API (`navigator.geolocation`)
  - **Backend**: Express.js REST API (`POST /api/sos/trigger`)
  - **Database**: MongoDB & Mongoose ([`SOSAlert.js`](file:///c:/Women-Safety/Backend/models/SOSAlert.js))
  - **Alerts**: EmailJS (`@emailjs/browser`) & Nodemailer for instant email delivery with Google Maps links.

---

### 2. 🎙️ Voice-Activated SOS Trigger (Hands-Free Emergency)
- **Description**: Listens continuously in the background for voice commands. When trigger words like `"help"`, `"save me"`, `"emergency"`, or `"danger"` are detected, an SOS alert is automatically dispatched hands-free.
- **Tech Used**:
  - **Browser API**: Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`)
  - **Frontend**: React Component ([`VoiceSOS.jsx`](file:///c:/Women-Safety/Frontend/src/components/VoiceSOS.jsx))
  - **Feedback**: React Hot Toast for voice detection feedback.

---

### 3. 🔊 High-Decibel Panic Siren & Audio Alarm
- **Description**: Emits a loud, high-pitched alarm sound directly through the device speaker accompanied by visual flashing red strobe effects to scare off potential attackers and alert people nearby.
- **Tech Used**:
  - **Browser API**: Web Audio API (`AudioContext` / OscillatorNode) for synthetic siren frequency generation
  - **Frontend**: React Component ([`PanicSiren.jsx`](file:///c:/Women-Safety/Frontend/src/components/PanicSiren.jsx))
  - **Styling**: CSS `@keyframes` animations for visual strobe effects.

---

### 4. 📞 Simulated Fake Incoming Call
- **Description**: Simulates a realistic incoming call UI complete with caller name, selectable timer (Instant, 5s, 10s, 30s), ringtone sound, and interactive answer/decline screens with an active call timer to help users escape uncomfortable or unsafe situations cleanly.
- **Tech Used**:
  - **Frontend**: React Modal & State Management ([`FakeCallModal.jsx`](file:///c:/Women-Safety/Frontend/src/components/FakeCallModal.jsx))
  - **Audio**: HTML5 Audio API for simulated ringtone sound
  - **Styling**: Vanilla CSS for mobile screen simulation.

---

### 5. 📍 Real-Time Location Tracking & Sharing
- **Description**: Tracks live GPS coordinates (latitude, longitude, accuracy), logs movement history, and provides one-click location sharing via WhatsApp and Email to trusted contacts.
- **Tech Used**:
  - **Browser API**: HTML5 Geolocation API (`navigator.geolocation.watchPosition`)
  - **Integrations**: Google Maps URL API (`https://www.google.com/maps?q=lat,lng`)
  - **Frontend**: React Page ([`Location.jsx`](file:///c:/Women-Safety/Frontend/src/pages/Location.jsx))
  - **Backend**: Express API (`/api/location`) & MongoDB ([`LocationLog.js`](file:///c:/Women-Safety/Backend/models/LocationLog.js)).

---

### 6. 👥 Emergency Contacts Management
- **Description**: Allows users to store, edit, view, and delete primary emergency contacts (Name, Phone Number, Email, Relationship).
- **Tech Used**:
  - **Frontend**: React Forms & Dynamic Lists ([`Contacts.jsx`](file:///c:/Women-Safety/Frontend/src/pages/Contacts.jsx))
  - **Backend**: Express REST Routes (`/api/contacts`)
  - **Database**: MongoDB Mongoose Schema ([`EmergencyContact.js`](file:///c:/Women-Safety/Backend/models/EmergencyContact.js)).

---

### 7. ☎️ Emergency Helpline Directory Widget
- **Description**: Instant access widget listing national emergency numbers (Police `112`, Women Helpline `1091`, Domestic Abuse `181`, Ambulance `102`) with direct one-tap calling capabilities.
- **Tech Used**:
  - **Protocol**: HTML5 `tel:` URI protocol scheme
  - **Frontend**: React Component ([`HelplineWidget.jsx`](file:///c:/Women-Safety/Frontend/src/components/HelplineWidget.jsx)).

---

### 8. 🔑 User Authentication & Security
- **Description**: User registration, login, secure password storage, session handling via JWT, and protected frontend routing.
- **Tech Used**:
  - **Security**: `bcryptjs` (Password Hashing), `jsonwebtoken` (JWT Authentication)
  - **Frontend**: React Context API (`AuthContext`), React Router DOM ([`ProtectedRoute.jsx`](file:///c:/Women-Safety/Frontend/src/components/ProtectedRoute.jsx))
  - **Backend**: Express Auth Middleware ([`authMiddleware.js`](file:///c:/Women-Safety/Backend/middleware/authMiddleware.js)) & MongoDB ([`User.js`](file:///c:/Women-Safety/Backend/models/User.js)).

---

### 9. 🛡️ Admin SOS Command Center & Audit Logs
- **Description**: Dedicated dashboard for administrators to monitor active SOS alerts in real time, view user location logs, manage user accounts, resolve emergency cases, and inspect system audit logs.
- **Tech Used**:
  - **Frontend**: React Admin Portal ([`AdminSOSCenter.jsx`](file:///c:/Women-Safety/Frontend/src/pages/admin/AdminSOSCenter.jsx), [`AdminLogs.jsx`](file:///c:/Women-Safety/Frontend/src/pages/admin/AdminLogs.jsx), [`AdminUsers.jsx`](file:///c:/Women-Safety/Frontend/src/pages/admin/AdminUsers.jsx))
  - **Backend**: Express Admin Controller & Middleware ([`admin.js`](file:///c:/Women-Safety/Backend/routes/admin.js))
  - **Database**: Aggregated Mongoose queries across `User`, `SOSAlert`, `LocationLog`, and `ActivityLog`.

---

## 📁 Repository Directory Structure

```
Women-Safety/
├── Backend/
│   ├── config/             # DB connection setup
│   ├── controllers/        # Request handlers (auth, SOS, location, admin, etc.)
│   ├── middleware/         # Auth & Admin JWT verification
│   ├── models/             # Mongoose schemas (User, SOSAlert, EmergencyContact, etc.)
│   ├── routes/             # Express API routes
│   ├── createAdmin.js      # Script to seed initial Super Admin account
│   ├── server.js           # Express server entry point
│   ├── .env                # Environment configuration
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/            # Axios API instances & service calls
│   │   ├── components/     # Reusable UI (VoiceSOS, PanicSiren, FakeCallModal, etc.)
│   │   ├── context/        # React Auth & Alert context
│   │   ├── pages/          # App pages (Dashboard, Location, SOSPage, Contacts, etc.)
│   │   │   └── admin/      # Admin pages (AdminSOSCenter, AdminLogs, AdminUsers, etc.)
│   │   ├── App.jsx         # Routes setup
│   │   ├── main.jsx        # App entry point
│   │   └── index.css       # Core styling & glassmorphism theme
│   └── package.json
└── README.md
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance running on `mongodb://localhost:27017` or MongoDB Atlas)

---

### 1. Setup & Run Backend

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables in `Backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/women_safety
   JWT_SECRET=womensafety_super_secret_2024
   JWT_EXPIRE=7d
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. Create the initial **Admin Account**:
   ```bash
   node createAdmin.js
   ```
   *Default Admin Credentials:*
   - **Email**: `admin@womensafety.com`
   - **Password**: `Admin@123`

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will start on `http://localhost:5000`.

---

### 2. Setup & Run Frontend

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🌐 API Routes Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `POST` | `/api/sos/trigger` | Trigger SOS emergency alert | Protected (User) |
| `GET` | `/api/contacts` | Get user's emergency contacts | Protected (User) |
| `POST` | `/api/contacts` | Add a new emergency contact | Protected (User) |
| `POST` | `/api/location/log` | Record current GPS coordinates | Protected (User) |
| `GET` | `/api/admin/sos` | View all active & past SOS alerts | Admin Only |
| `GET` | `/api/admin/users` | List all registered users | Admin Only |
| `GET` | `/api/admin/logs` | Fetch system activity logs | Admin Only |

---

## 🔒 Security & Privacy Features
- Passwords are encrypted using **bcrypt** salt hashing.
- API endpoints are protected using **JWT (JSON Web Token)** authentication.
- Admin routes are shielded with role-based access control (`role === 'admin'`).
- Sensitive data is stored securely in environment variables (`.env`).
