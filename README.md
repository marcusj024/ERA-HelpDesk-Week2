# ERA Tech Solutions Help Desk

A full-stack help desk application built as a learning project to demonstrate how a support portal can combine a React frontend with an Express backend, MySQL for structured ticket data, and MongoDB for notes and activity logs.

## Project Audit Summary

This project is a solid full-stack prototype with a clear separation of concerns:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Data layer: MySQL for tickets and users, MongoDB for ticket notes and activity logs
- User experience: login flow, dashboard, ticket list, ticket detail view, and ticket creation

### What is working well

- Clean component-based frontend structure
- Clear API layer between frontend and backend
- Dual-database design demonstrates both relational and document-based storage
- Ticket detail pages include both MySQL and MongoDB-backed information

### Recommended improvements

- Add authentication with hashed passwords and session/JWT-based security
- Add automated tests for frontend and backend
- Add seed scripts and example environment files
- Improve data display by resolving department names instead of raw IDs
- Add proper validation, logging, and error handling for production readiness

## Features

- User login flow
- Dashboard with ticket statistics and recent activity
- Ticket listing with status and priority filters
- Ticket detail page with:
    - MySQL ticket data
    - MongoDB technician notes
    - MongoDB activity logs
- Ticket creation form
- REST-style API endpoints for users, tickets, notes, and logs

## Tech Stack

| Layer       | Technology                |
| ----------- | ------------------------- |
| Frontend    | React, Vite, Tailwind CSS |
| Backend     | Node.js, Express          |
| Database 1  | MySQL                     |
| Database 2  | MongoDB                   |
| Environment | dotenv                    |

## Project Structure

```text
backend/
  db.js
  mongo.js
  server.js
  package.json
frontend/
  src/
    api/
    components/
    pages/
  package.json
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js installed
- MySQL running locally or remotely
- MongoDB running locally or remotely

## Environment Setup

### Backend

Create a .env file inside the backend folder with values similar to:

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=helpdesk_db
MONGO_URI=mongodb://localhost:27017
```

### Frontend

Create a .env file inside the frontend folder with:

```env
VITE_API_URL=http://localhost:3000
```

## Installation

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

The backend will run on http://localhost:3000 and the frontend on http://localhost:5173.

## Running the App

1. Start MySQL and MongoDB.
2. Start the backend server.
3. Start the frontend development server.
4. Open the frontend URL in your browser.

## API Overview

The backend exposes endpoints for:

- GET /departments
- GET /users
- GET /tickets
- GET /tickets/open
- GET /tickets/details
- GET /tickets/:id/details
- POST /users
- POST /tickets
- GET /ticket-notes
- GET /ticket-notes/:ticketId
- POST /ticket-notes
- GET /activity-logs
- POST /activity-logs
- POST /login

## Current Status

- Frontend production build verified successfully with: npm run build
- Backend requires working MySQL and MongoDB services to run properly

## Suggested Next Steps

To turn this into a production-ready support platform, the next priorities should be:

1. Add secure authentication and password hashing
2. Introduce proper database migrations and seed data
3. Add automated tests
4. Improve UI polish and form validation
5. Add deployment configuration and environment documentation

## License

This project is intended for educational and portfolio use.
