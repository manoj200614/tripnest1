# TripNest Backend

Collaborative trip planning API - Node.js, Express, MongoDB, JWT.

## Run
1. Install Node.js and MongoDB (or use a free MongoDB Atlas URI in `.env`)
2. `npm install`
3. `npm start`   -> http://localhost:5000

## API (all /api/trips routes need header `Authorization: Bearer <token>`)
| Method | URL | Purpose |
|---|---|---|
| POST | /api/auth/register | Sign up (name, email, password) |
| POST | /api/auth/login | Login, returns token |
| POST | /api/trips | Create trip |
| GET | /api/trips | List my + shared trips |
| GET | /api/trips/:id | Trip details |
| PUT | /api/trips/:id | Update trip |
| DELETE | /api/trips/:id | Delete trip (owner) |
| POST/DELETE | /api/trips/:id/destinations[/:itemId] | Add / remove destination |
| POST/DELETE | /api/trips/:id/itinerary[/:itemId] | Add / remove itinerary item |
| POST/DELETE | /api/trips/:id/expenses[/:itemId] | Add / remove expense |
| GET | /api/trips/:id/expenses/summary | Total, per category, per person |
| POST | /api/trips/:id/share | Share with friend (email) |

## Frontend
Plain HTML/CSS/JS in `/public`, served by Express. After `npm start`, open http://localhost:5000

## MERN setup (React frontend in /client)
Terminal 1 (backend):  `npm install` then `npm start`   -> API on http://localhost:5000
Terminal 2 (frontend): `cd client`, `npm install`, `npm run dev`  -> open http://localhost:5173
(The older plain-JS frontend is kept in /old-vanilla-frontend as backup.)
