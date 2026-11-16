# Gifted Hands – Professional Hair Salon Website

A complete, responsive website foundation for **Gifted Hands**, a hair styling and braiding business. The project includes a public-facing website, a booking/contact request flow, a Go REST API backend, PostgreSQL persistence, and a secure administrator dashboard.

> **Business details used (as provided):**  
> - Business name: **Gifted Hands**  
> - Services: Knotless braids, Normal braids, Twist-outs, Ghanaian hairstyles  
> - Phone: **0712117024** (WhatsApp links use Kenya international format: `254712117024`)  
> 
> Unknown details (prices, durations, exact location, social URLs, reviews, real photos) are intentionally left as **configurable placeholders** and can be updated without changing core application logic.

## Features

### Public website (HTML/CSS/Vanilla JS)
- Responsive, mobile-first design with pink/white/neutral salon aesthetic
- Pages: **Home, About, Services, Gallery, Booking, Contact**
- Hero section with full-cover background image and prominent booking CTAs
- Services loaded from API and displayed with name, description, image, price placeholder, duration placeholder, and booking action
- Gallery with category filters and responsive image grid
- WhatsApp contact/booking inquiry buttons across the site
- Functional booking request form with client-side validation and API submission
- Functional contact form with validation and API submission
- Configurable placeholders for location, social links, testimonials, and images

### Backend (Go, REST API)
- Clean, organized Go backend (`cmd`, `internal` packages)
- REST endpoints for bookings, services, and inquiries
- Administrator authentication with JWT
- Password hashing with bcrypt
- Protected admin routes
- PostgreSQL persistence with parameterized SQL queries
- Input validation, proper HTTP status codes, error handling, and CORS configuration
- Environment-based configuration (`.env` supported)

### Admin dashboard
- Secure admin login (no hardcoded production credentials)
- View customer bookings and contact details
- Approve/reject/update booking statuses (requests are **not** auto-confirmed)
- Delete bookings
- Manage hairstyle services (create, update, delete, activate/deactivate)
- View customer inquiries

### Database (PostgreSQL)
- Tables: `administrators`, `services`, `bookings`, `inquiries`
- Appropriate keys, constraints, timestamps, indexes, and enum status for bookings
- Migration scripts in `migrations/`

## Technologies Used
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Go (Golang), `net/http` (Go 1.22+ routing patterns), JWT, bcrypt
- **Database:** PostgreSQL
- **API:** REST (JSON over HTTP)
- **Version control:** Git / GitHub

## Project Structure

```text
.
├── backend/
│   ├── cmd/
│   │   ├── server/              # API + static frontend server entrypoint
│   │   └── createadmin/         # CLI tool to create admin users securely
│   └── internal/
│       ├── auth/                # Password hashing and JWT helpers
│       ├── config/              # Environment/config loading
│       ├── database/            # PostgreSQL connection management
│       ├── handlers/            # HTTP handlers (public + admin)
│       ├── middleware/          # CORS and admin auth middleware
│       ├── models/              # Data models
│       ├── repository/          # Database access (parameterized queries)
│       └── util/                # Validation and response helpers
├── frontend/
│   ├── admin/                   # Admin login and dashboard pages
│   ├── assets/images/           # Placeholder SVG images (replace with real photos)
│   ├── css/                     # Global styles
│   ├── js/                      # Frontend logic (config, API calls, forms, admin)
│   ├── index.html               # Home
│   ├── about.html               # About
│   ├── services.html            # Services
│   ├── gallery.html             # Gallery
│   ├── booking.html             # Booking request form
│   └── contact.html             # Contact page/form
├── migrations/
│   ├── 001_init.sql             # Schema, constraints, triggers
│   └── 002_seed_services.sql    # Default Gifted Hands services (placeholders)
├── docs/                        # Additional documentation (optional)
├── scripts/                     # Helper scripts (optional)
├── .env.example                 # Example environment configuration (no secrets)
├── .gitignore
├── go.mod
└── README.md
```

## Prerequisites
- **Go** 1.22+ (recommended)
- **PostgreSQL** 14+ (or compatible)
- **Git**
- A modern web browser

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your values:
   - `PORT` – server port (default `8080`)
   - `FRONTEND_DIR` – path to frontend files (default `./frontend`)
   - `DATABASE_URL` – PostgreSQL connection string (**required**)
   - `ALLOWED_ORIGINS` – comma-separated origins for CORS
   - `JWT_SECRET` – long random secret for admin tokens (**change in production**)
   - `ADMIN_SESSION_HOURS` – admin token/session lifetime

> **Security:** Never commit real `.env` secrets. Database credentials are server-side only and never exposed to frontend code.

## Database Setup

1. Create a PostgreSQL database (example):
   ```bash
   createdb gifted_hands
   ```
   Or via `psql`:
   ```sql
   CREATE DATABASE gifted_hands;
   ```

2. Apply migrations in order:
   ```bash
   psql "$DATABASE_URL" -f migrations/001_init.sql
   psql "$DATABASE_URL" -f migrations/002_seed_services.sql
   ```
   Replace `$DATABASE_URL` with your actual connection string if not exported in your shell.

`002_seed_services.sql` inserts the four offered services with **price/duration placeholders** and placeholder image paths. You can update them later via the admin dashboard, SQL, or by replacing records.

## Install Backend Dependencies

From the project root:
```bash
go mod tidy
```
This downloads required Go modules and generates/updates `go.sum`.

## Create an Administrator Account (Secure)

Do **not** hardcode admin credentials. Create an admin using the provided CLI tool:

```bash
# Ensure DATABASE_URL and a strong password are set (via env or flags)
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/gifted_hands?sslmode=disable"

go run ./backend/cmd/createadmin -username admin -password "StrongPasswordHere" -name "Gifted Hands Admin"
```

You can also provide `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_FULL_NAME` via environment variables.

## How to Run the Backend

Start the Go server (serves API and frontend static files):
```bash
# from project root, with .env configured
go run ./backend/cmd/server
```

The application will be available at: **http://localhost:8080** (or your configured `PORT`).

- Public site: `http://localhost:8080/`
- Admin login: `http://localhost:8080/admin/login.html`
- Health check: `http://localhost:8080/api/health`

## How to Run the Frontend

The frontend is static (HTML/CSS/JS) and is **served by the Go backend** in this project for simple same-origin API integration.

For UI-only development, you may open files with a static server, but API calls expect the backend at `/api` (same origin). Recommended: run the Go backend as above.

## API Documentation

Base path: `/api`

### Public endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/services` | Retrieve active services |
| POST | `/api/bookings` | Create a booking request (saved as `pending`, not auto-confirmed) |
| POST | `/api/inquiries` | Submit a customer inquiry/contact message |

#### `POST /api/bookings` body
```json
{
  "customer_name": "Jane Doe",
  "phone_number": "0712345678",
  "email": "optional@example.com",
  "service_id": 1,
  "service_name": "Knotless Braids",
  "preferred_date": "2026-12-01",
  "preferred_time": "14:00",
  "message": "Optional notes"
}
```
Required: `customer_name`, `phone_number`, `service_name`, `preferred_date` (YYYY-MM-DD), `preferred_time`. `email` is optional but validated if provided.

#### `POST /api/inquiries` body
```json
{
  "name": "Jane Doe",
  "phone_number": "0712345678",
  "email": "optional@example.com",
  "subject": "Style inquiry",
  "message": "Hello, I would like to know more..."
}
```
Required: `name`, `message`.

### Admin endpoints (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Authenticate admin, returns JWT token |
| GET | `/api/admin/bookings` | List all bookings |
| PATCH | `/api/admin/bookings/{id}` | Update booking status/notes (`pending`, `approved`, `rejected`, `completed`, `cancelled`) |
| DELETE | `/api/admin/bookings/{id}` | Delete a booking |
| GET | `/api/admin/inquiries` | List customer inquiries |
| GET | `/api/admin/services` | List all services (including inactive) |
| POST | `/api/admin/services` | Create a service |
| PUT | `/api/admin/services/{id}` | Update a service |
| DELETE | `/api/admin/services/{id}` | Delete a service |

#### `POST /api/admin/login` body
```json
{ "username": "admin", "password": "your-password" }
```

#### `PATCH /api/admin/bookings/{id}` body
```json
{ "status": "approved", "admin_notes": "Optional notes" }
```

## WhatsApp Integration
- WhatsApp buttons are available throughout the site and open `https://wa.me/254712117024` (Kenya international format) with a prefilled message.
- The booking page can compose a booking inquiry message and send it via WhatsApp.
- Configure number/display in `frontend/js/config.js` (`phoneDisplay`, `whatsappNumber`).

## Configuration & Customization
- **Phone/WhatsApp/location/socials:** `frontend/js/config.js`
- **Services, prices, durations, images:** managed via admin dashboard or database (`services` table)
- **Images:** replace placeholder SVGs in `frontend/assets/images/` with real photographs (keep filenames/paths or update `image_path` values accordingly)
- **Testimonials/location/address:** placeholders in HTML/config for easy editing once real information is available

## Testing

### Backend
```bash
# format check
gofmt -l backend

# build
go build ./backend/cmd/server ./backend/cmd/createadmin

# run tests (add tests as the project evolves)
go test ./...
```

### Manual verification checklist
- Website navigation across all pages (desktop and mobile menu)
- Booking form validation (required fields, phone/email format, date not in past) and successful API submission
- Contact form validation and submission
- Services load from API on Home/Services pages
- Gallery category filtering and responsive layout
- WhatsApp buttons open correct `wa.me` link with prefilled message
- Admin login, token-protected dashboard access
- Booking approval/rejection/status updates and deletion
- Service create/update/delete from admin dashboard
- Database records created/updated correctly

### API smoke tests (examples)
```bash
# health
curl -s http://localhost:8080/api/health

# list services
curl -s http://localhost:8080/api/services

# create booking request
curl -s -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test User","phone_number":"0712117024","service_name":"Knotless Braids","preferred_date":"2026-12-01","preferred_time":"10:00"}'
```

## Deployment Notes
- Set strong production values for `JWT_SECRET` and `DATABASE_URL` via environment variables or a secret manager.
- Run migrations against the production PostgreSQL database.
- Create admin users with `backend/cmd/createadmin` (do not seed hardcoded credentials).
- Build a production binary:
  ```bash
  go build -o bin/gifted-hands-server ./backend/cmd/server
  ./bin/gifted-hands-server
  ```
- Serve behind HTTPS (reverse proxy like Nginx/Caddy) and configure `ALLOWED_ORIGINS` appropriately.
- Ensure PostgreSQL backups, logging/monitoring, and least-privilege DB credentials.
- Replace placeholder images/content with real business assets when available.

## Notes
- Booking requests are stored with status `pending` and require manual approval by the administrator.
- No business information, prices, reviews, or addresses were invented; placeholders are provided for easy configuration.
- Frontend avoids frameworks as requested and uses clean, maintainable vanilla HTML/CSS/JS.
