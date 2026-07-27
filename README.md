# Event Management API

A REST API backend for an event management platform (web + mobile), built with
Node.js, Express, and MySQL. It supports event discovery, ticket types,
bookings with inventory locking, QR-code check-in, payments, saved events,
speakers, and role-based access control.

## Tech stack

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express 5
- **Database:** MySQL (via `mysql2/promise`, connection pool)
- **Auth:** JWT (`jsonwebtoken`) + password hashing (`bcrypt`)
- **QR codes:** `qrcode`
- **Dev tooling:** `nodemon`

## Project structure

```
.
├── app.js                  # Express app setup, route mounting, server start
├── config/
│   └── db.js                # MySQL connection pool
├── constants/
│   └── roles.js             # Role enum: admin | organizer | user
├── middlewares/
│   ├── authMiddleware.js    # protect (JWT check), authorize (role check)
│   └── errorMiddleware.js   # notFound (404) + centralized errorHandler
├── models/                  # Raw SQL data access, one file per table
├── controllers/              # Request handling + business logic
├── routes/                  # Express routers, one per resource
├── .env.example              # Template for required environment variables
├── api.http                  # Ready-to-run sample requests (REST Client)
└── FIXES.md                  # Log of bugs found and fixed in this codebase
```

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in real values:
```bash
cp .env.example .env
```

| Variable         | Description                                   |
|------------------|------------------------------------------------|
| `DB_HOST`        | MySQL host (e.g. `localhost`)                  |
| `DB_PORT`        | MySQL port (default `3306`)                    |
| `DB_USER`        | MySQL username                                 |
| `DB_PASSWORD`    | MySQL password                                 |
| `DB_NAME`        | Database name                                  |
| `JWT_SECRET`     | Long random secret used to sign JWTs — generate your own, never reuse the placeholder |
| `JWT_EXPIRES_IN` | Optional, defaults to `7d`                     |
| `PORT`           | Optional, defaults to `5000`                   |

**Never commit `.env`.** It's already listed in `.gitignore`.

### 3. Create the database schema
This repo doesn't include migration files — create the following tables in
your MySQL database before starting the server: `users`, `categories`,
`events`, `ticket_types`, `bookings`, `payments`, `saved_events`, `speakers`,
`event_speakers`. Match the column names used in `models/*.js` (e.g.
`events.organizer_id`, `bookings.checked_in_at`, `ticket_types.available_tickets`,
soft-delete columns `deleted_at` on `users`, `events`, and `ticket_types`).

### 4. Run the server
```bash
npm run dev
```
The API is served at `http://localhost:5000/api` (or `PORT` if set), with a
health check at `GET /`.

## Authentication & roles

- Auth is Bearer-token based. Send `Authorization: Bearer <token>` on
  protected routes.
- Get a token via `POST /api/auth/register` or `POST /api/auth/login`.
- Roles: `admin`, `organizer`, `user` (see `constants/roles.js`). New
  registrations always get `user` — promote someone to `organizer`/`admin`
  directly in the database.
- Ownership checks (e.g. "only the event's organizer or an admin can edit
  it") are enforced inside the controllers, not just by role.

## API reference

All paths below are prefixed with `/api`. 🔒 = requires a valid token.
Role/ownership notes are in the last column.

### Auth — `/auth`
| Method | Path | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| GET | `/me` | 🔒 any logged-in user |

### Users — `/users`
| Method | Path | Access |
|---|---|---|
| PUT | `/me` | 🔒 self |
| GET | `/` | 🔒 admin |
| GET | `/:id` | 🔒 admin |
| PUT | `/:id` | 🔒 admin |
| DELETE | `/:id` | 🔒 admin (soft delete) |

### Categories — `/categories`
| Method | Path | Access |
|---|---|---|
| GET | `/` | Public |
| GET | `/:id` | Public |
| POST | `/` | 🔒 admin |
| PUT | `/:id` | 🔒 admin |
| DELETE | `/:id` | 🔒 admin (blocked if events still reference it) |

### Events — `/events`
| Method | Path | Access |
|---|---|---|
| GET | `/` | Public — filters: `category`, `location`, `status`, `from`, `to`, `search`, `page`, `limit` |
| GET | `/:id` | Public |
| POST | `/` | 🔒 organizer or admin |
| PUT | `/:id` | 🔒 event's organizer or admin |
| DELETE | `/:id` | 🔒 event's organizer or admin (soft delete) |

### Ticket types — `/ticket-types`
| Method | Path | Access |
|---|---|---|
| GET | `/event/:eventId` | Public |
| POST | `/` | 🔒 event's organizer or admin |
| PUT | `/:id` | 🔒 event's organizer or admin |
| DELETE | `/:id` | 🔒 event's organizer or admin (soft delete) |

### Bookings — `/bookings`
| Method | Path | Access |
|---|---|---|
| POST | `/` | 🔒 any logged-in user — creates a `pending` booking, locks ticket inventory |
| GET | `/my` | 🔒 own bookings |
| GET | `/:id` | 🔒 booking owner, event organizer, or admin |
| GET | `/` | 🔒 admin — all bookings |
| POST | `/verify` | 🔒 event organizer or admin — checks in a scanned ticket token |
| GET | `/:id/qrcode` | 🔒 booking owner, event organizer, or admin — only for `confirmed` bookings |
| PUT | `/:id/cancel` | 🔒 booking owner or admin — releases inventory back |

### Payments — `/payments`
| Method | Path | Access |
|---|---|---|
| POST | `/` | 🔒 booking owner — marks booking `confirmed` |
| GET | `/booking/:bookingId` | 🔒 booking owner or admin |

### Saved events — `/saved-events`
| Method | Path | Access |
|---|---|---|
| GET | `/my` | 🔒 own saved events |
| POST | `/:eventId` | 🔒 any logged-in user |
| DELETE | `/:eventId` | 🔒 any logged-in user |

### Speakers — `/speakers`
| Method | Path | Access |
|---|---|---|
| GET | `/` | Public |
| GET | `/event/:eventId` | Public |
| POST | `/` | 🔒 organizer or admin |
| POST | `/link` | 🔒 organizer or admin — links a speaker to an event |

## Trying it out

`api.http` in the repo root has ready-made requests (works with the VS Code
REST Client extension or IntelliJ HTTP client) covering registration, login,
and every endpoint above, including a couple of intentional-failure cases
(403/400) to sanity-check the access rules.

## Notes

- See `FIXES.md` for a log of bugs that were found and fixed in this
  codebase, with before/after code for each one.
- CORS is currently wide open (`cors()` with no options) — restrict it to
  your actual frontend origin(s) before deploying to production.
- Booking creation uses a row lock (`SELECT ... FOR UPDATE`) inside a
  transaction to prevent overselling tickets under concurrent requests.
