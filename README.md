# SlotSwapper

SlotSwapper is a full-stack MERN web application that enables users to manage, mark, and exchange time slots with others. 
It’s designed as a peer-to-peer time-slot swapping system — built to demonstrate full-stack proficiency across React, Express, MongoDB, and JWT authentication.

## Project Overview

The idea is simple: users maintain a calendar of their own events or slots. Some slots are marked as "swappable", meaning the user is open to exchanging that time with someone else. 

Another user can then request a swap, and if both agree, their event ownerships are exchanged — keeping each calendar automatically updated.

### Design Choices

- Authentication Context (React): Implemented via useContext and localStorage to persist sessions.
- Protected Routing: Users cannot access dashboard routes without a valid token.
- Clean Modular Backend: Built with Express and structured route files for auth, events, and swaps.
- Minimal UI/UX: Soft glassmorphism design with gradient backgrounds (App.css) for a modern, distraction-free experience.
- RESTful API: Follows conventional route patterns for clear backend logic.
- State Synchronization: Automatically updates local UI after a swap or event update (no manual refresh needed).

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + Vite |
| Styling | CSS (Glassmorphism) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Optional Tools | Postman (API testing), Render/Vercel (deployment) |

## Setup & Run Locally

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/slotswapper.git
cd slotswapper
```

### 2. Install Dependencies (Backend)
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in root:
```bash
MONGO_URI=mongodb+srv://<your_cluster_url>
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4. Start the Backend
```bash
npm run dev
```
Backend will run on:  
http://localhost:5000

### 5. Run Frontend (React)
If frontend is inside `/client`, navigate there:
```bash
cd client
npm install
npm run dev
```
Frontend runs at:  
http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **AUTH** |  |  |
| POST | /api/signup | Create new user |
| POST | /api/login | Authenticate user & return token |
| **EVENTS** |  |  |
| GET | /api/events | Fetch all events of logged-in user |
| POST | /api/events | Create new event |
| PUT | /api/events/:id/status | Toggle event BUSY ↔ SWAPPABLE |
| **SWAPS** |  |  |
| GET | /api/swappable-slots | View swappable slots from other users |
| POST | /api/swap-request | Create a swap request between two slots |
| POST | /api/swap-response/:id | Accept or reject a swap request |

Tip: You can import the included `SlotSwapper.postman_collection.json` into Postman for quick API testing.

## Folder Structure
```
SlotSwapper/
├── server.js                  # Express server
├── package.json               # Dependencies & scripts
├── .env                       # Environment variables
├── /routes                    # API route files
├── /models                    # Mongoose schemas
└── /src                       # React frontend
    ├── App.jsx
    ├── App.css
    ├── components/
    └── index.css
```

## Assumptions & Challenges

- Assumptions:
  - Each event belongs to one user.
  - Only "SWAPPABLE" events can participate in swaps.
  - Users cannot swap with themselves.
- Challenges Faced:
  - Implementing atomic updates during accepted swaps (to exchange owners cleanly).
  - Handling optimistic UI updates to reflect swaps instantly.
  - Maintaining synchronization between multiple users’ data (avoiding race conditions).
- Future Improvements:
  - Real-time updates via WebSockets for instant notifications.
  - Integration tests for swap transactions.
  - Dockerfile + docker-compose for one-command setup.

## Deployment
If deployed, include:
- Frontend: [Vercel/Netlify Link]  
- Backend: [Render/Heroku Link]  
- Database: MongoDB Atlas Cluster  
