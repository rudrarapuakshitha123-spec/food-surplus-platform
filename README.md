# 🥗 Smart Food Surplus Detection and Availability Notification Platform

A full-stack MERN + Socket.io application that connects food donors with nearby recipients in real time, with automated expiry handling via cron jobs.

## Tech Stack
- **Frontend:** React 18, React Router v6, Axios, Socket.io-client
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Real-time:** Socket.io
- **Auth:** JWT + bcryptjs
- **Email:** Nodemailer (Gmail SMTP)
- **Scheduling:** node-cron

## Project Structure
```
food-surplus-platform/
├── backend/     → Express API, MongoDB models, Socket.io, cron jobs
└── frontend/    → React SPA
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier is fine)
- A Gmail account with an App Password (for email alerts)

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment variables
Copy `backend/.env.example` to `backend/.env` and fill in real values:
```
MONGO_URI=...
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
```
Copy `frontend/.env.example` to `frontend/.env` (defaults work for local dev).

### 4. Run in development (both servers together)
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## API Overview
See inline comments in `backend/routes/*.js` — every route documents its method, auth requirement, and purpose.

## Deployment
- **Backend → Render:** connect the repo, root directory `backend`, build `npm install`, start `node server.js`, set env vars in the Render dashboard.
- **Frontend → Vercel:** root directory `frontend`, build `npm run build`, set `REACT_APP_API_URL` / `REACT_APP_SOCKET_URL` to your deployed backend URL.
- **Database → MongoDB Atlas:** whitelist `0.0.0.0/0` so Render can connect.

## Testing Checklist
- Register a donor and a recipient with the **same area code** in two browser tabs.
- Post a listing as the donor → the recipient's bell icon should light up instantly.
- Reserve it as the recipient → donor gets a notification.
- Confirm → Complete the reservation as the donor.
- Set a listing to expire in 1 minute and watch the cron job auto-expire it (runs every 5 min).
