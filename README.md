# Dinesh Portfolio — PostgreSQL Integration

## Overview

This repository contains the **full-stack portfolio** with a real PostgreSQL database backend.
Every section (Hero, About, Skills, Projects, Resume, Contact) reads from and writes to PostgreSQL. Data persists across page refreshes, browser restarts, and server restarts.

---

## Architecture

```
React Frontend (JSX)
       │
       │  fetch() to REST API
       ▼
Express.js Backend (Node.js)
       │
       │  node-postgres (pg)
       ▼
PostgreSQL Database
```

---

## Files Delivered

| File | Purpose |
|------|---------|
| `DineshPortfolio-PG.jsx` | Updated React frontend (replaces your original) |
| `portfolio-backend/server.js` | Express + PostgreSQL REST API |
| `portfolio-backend/schema.sql` | SQL schema + seed data |
| `portfolio-backend/package.json` | Node.js dependencies |
| `portfolio-backend/.env.example` | Environment variable template |

---

## Setup

### 1. PostgreSQL Database

Create a database:
```sql
CREATE DATABASE portfolio;
```

Run the schema (creates tables and seeds default data):
```bash
psql -U postgres -d portfolio -f portfolio-backend/schema.sql
```

### 2. Backend (Node.js API)

```bash
cd portfolio-backend
cp .env.example .env
# Edit .env with your DB credentials:
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_NAME=portfolio
#   DB_USER=postgres
#   DB_PASSWORD=your_password

npm install
npm start
# API runs on http://localhost:4000
```

Verify it's working:
```
GET http://localhost:4000/api/health  →  {"status":"ok","db":"connected"}
```

### 3. Frontend (React)

Use the updated `DineshPortfolio-PG.jsx` in your React project (Vite, CRA, or Next.js).

The API base URL is configured at the top of the file:
```js
const API_BASE = "http://localhost:4000/api";
```

Change this to your deployed backend URL in production (e.g. `https://api.yourdomain.com/api`).

---

## API Endpoints

### Bulk load (initial page load)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/portfolio` | Load ALL sections in one request |
| GET | `/api/health` | Health check |

### Hero
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/hero` | Get hero data |
| PUT | `/api/hero` | Update hero (name, title, subtitle, tagline, available, photo_b64) |

### About
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/about` | Get about data |
| PUT | `/api/about` | Update about section |

### Skills
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/skills` | List all skills |
| POST | `/api/skills` | Create new skill |
| PUT | `/api/skills/:id` | Update skill |
| DELETE | `/api/skills/:id` | Delete skill |

### Projects
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (auto-renumbers) |

### Resume
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/resume` | Get resume data |
| PUT | `/api/resume` | Update resume (includes base64 PDF) |

### Contact
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/contact` | Get contact info |
| PUT | `/api/contact` | Update contact info |
| POST | `/api/contact/message` | Submit a contact form message |
| GET | `/api/contact/messages` | List all received messages (admin) |

---

## Production Deployment

### Cloud Database (Neon, Supabase, RDS, etc.)
Uncomment the SSL line in `server.js`:
```js
ssl: { rejectUnauthorized: false },
```

Update `.env`:
```
DB_HOST=your-cloud-db-host
DB_NAME=portfolio
DB_USER=your_user
DB_PASSWORD=your_password
```

### Environment Variables for Vite / Next.js
```
VITE_API_BASE=https://api.yourdomain.com/api
```

Then in `DineshPortfolio-PG.jsx`:
```js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
```

---

## How Admin Panel Saves Work

1. Admin logs in with password (`Dinesh@2025`)
2. Makes changes in the Admin Panel tabs
3. Clicks **💾 Save All to DB** → `PUT` requests to all sections
4. Skill/Project Add/Edit/Delete → immediate `POST`/`PUT`/`DELETE` per item
5. Contact form submissions → stored in `contact_messages` table
6. On every save, `reloadData()` re-fetches from PostgreSQL to confirm persistence

---

## Database Tables

- `hero` — name, title, subtitle, tagline, available, photo_b64
- `about` — bio, bio2, location, email, experience, projects_count, ai_models
- `skills` — icon, name, description, tags (text array), sort_order
- `projects` — num, name, type, year, description, tags (text array), link, sort_order
- `certificates` — name, issuer, year, badge (for future use)
- `resume` — file_name, file_data (base64 PDF), education, experience, certifications, open_source
- `contact` — email, linkedin, github, twitter
- `contact_messages` — name, email, message, created_at
