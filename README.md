# TOLLOE EXPRESS — Courier Management Platform

A production-ready, full-stack courier management web application for **TOLLOE EXPRESS**, an Ethiopian courier company.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access 15min) + httpOnly cookie refresh (7d) |
| Maps | Leaflet + OpenStreetMap (no API key) |
| Email | Nodemailer (Ethereal in dev, configurable) |
| SMS | Africastalking stub (pluggable) |
| File Upload | Multer (local disk → plug in S3) |
| PDF/Invoice | HTML invoice (plug in Puppeteer for true PDF) |
| Bulk Upload | csv-parse + xlsx |
| i18n | next-intl (English + Amharic stub) |
| Charts | Recharts |

---

## Project Structure

```
toloe-express/
├── apps/
│   ├── web/                    ← Next.js 14 frontend (port 3000)
│   └── server/                 ← Express API (port 4000)
├── packages/
│   ├── database/               ← Prisma schema + client + seed
│   └── types/                  ← Shared TypeScript types
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **PostgreSQL** 15+

---

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
# Database
cp packages/database/.env.example packages/database/.env
# Edit DATABASE_URL in packages/database/.env

# Server
cp apps/server/.env.example apps/server/.env
# Edit JWT_SECRET, JWT_REFRESH_SECRET, and optionally SMTP settings

# Web
cp apps/web/.env.local.example apps/web/.env.local
```

### 3. Set up the database

```bash
# Push schema to PostgreSQL
pnpm --filter @repo/database db:push

# Seed with initial data (service areas, admin user, sample data)
pnpm --filter @repo/database db:seed
```

### 4. Start development servers

```bash
pnpm dev
# → Web:    http://localhost:3000
# → Server: http://localhost:4000
# → API:    http://localhost:4000/api/v1
```

---

## Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@toloeexpress.com | Admin@123456 |
| Staff | staff@toloeexpress.com | Staff@123456 |
| Driver | driver@toloeexpress.com | Driver@123456 |
| Customer | customer@example.com | Customer@123456 |
| Business | business@etrade.com | Business@123456 |

---

## Application Routes

### Public Website

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/track` | Enter tracking number |
| `/track/:trackingNumber` | Live tracking timeline + map |
| `/book` | Multi-step shipment booking |
| `/calculate` | Price calculator (ETB) |
| `/about` | About TOLLOE EXPRESS |
| `/services` | Service offerings |
| `/coverage` | Service areas map |
| `/contact` | Contact form |
| `/faq` | FAQ accordion |
| `/blog` | Blog & news |
| `/blog/:slug` | Blog post |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/careers` | Job openings |
| `/partners` | Partner program |

### Auth
| URL | Description |
|-----|-------------|
| `/login` | Sign in |
| `/register` | Create account (Customer or Business) |
| `/forgot-password` | Password reset request |

### Customer Dashboard (`/dashboard/*`)
| URL | Description |
|-----|-------------|
| `/dashboard` | Overview with stats |
| `/dashboard/shipments` | Shipment history with filters |
| `/dashboard/shipments/:id` | Shipment detail + tracking timeline |
| `/dashboard/book` | Quick booking form |
| `/dashboard/addresses` | Address book |
| `/dashboard/profile` | Edit profile |

### Business Portal (`/business/*`)
| URL | Description |
|-----|-------------|
| `/business` | Overview stats |
| `/business/shipments` | All company shipments |
| `/business/bulk-upload` | CSV/Excel upload + CSV template |
| `/business/api` | API keys + webhook management |

### Admin Dashboard (`/admin/*`)
| URL | Description |
|-----|-------------|
| `/admin` | Stats dashboard + recent shipments |
| `/admin/shipments` | All shipments with status update |
| `/admin/users` | User management |
| `/admin/drivers` | Driver management |
| `/admin/analytics` | Bar + line charts (shipments + revenue) |
| `/admin/service-areas` | Manage covered cities |
| `/admin/blog` | Blog CMS |

---

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Authentication

```
POST /auth/register      Create account
POST /auth/login         Login → access token + refresh cookie
POST /auth/refresh       Refresh access token (uses cookie)
POST /auth/logout        Logout
GET  /auth/me            Get current user
```

### Tracking (public — no auth)

```
GET /track/:trackingNumber
```

### Shipments

```
GET    /shipments              List (role-filtered)
POST   /shipments              Create shipment
GET    /shipments/:id          Get detail
PUT    /shipments/:id          Update (Admin/Staff)
POST   /shipments/:id/events   Add tracking event (Admin/Staff)
PUT    /shipments/:id/assign-driver  Assign driver (Admin/Staff)
POST   /shipments/:id/proof-of-delivery  POD upload (Staff)
GET    /shipments/:id/invoice  Download invoice HTML
POST   /shipments/bulk-upload  Upload CSV/Excel (Business/Admin)
```

### Calculator (public)

```
POST /calculator/estimate
Body: { originCity, destinationCity, weight, serviceType, isCOD? }
```

### Price Formula

```
total = baseRate[serviceType]
      + weight × 15 ETB/kg
      + haversineDistance(origin, destination) × 2 ETB/km
      + (isCOD ? 30 : 0)

baseRate: ECONOMY=50, STANDARD=80, EXPRESS=120, SAME_DAY=200 (ETB)
```

### Business

```
GET    /business/profile
PUT    /business/profile
GET    /business/api-keys
POST   /business/api-keys     { name }
DELETE /business/api-keys/:keyId
GET    /business/webhooks
POST   /business/webhooks     { url, events[] }
DELETE /business/webhooks/:webhookId
```

### Admin

```
GET  /admin/dashboard
GET  /admin/reports?days=30
GET  /admin/drivers
POST /admin/drivers
PUT  /admin/drivers/:id
GET  /admin/service-areas
POST /admin/service-areas
PUT  /admin/service-areas/:id
GET  /admin/promo-codes
POST /admin/promo-codes
```

### Blog (public read, auth write)

```
GET    /blog/posts
GET    /blog/posts/:slug
POST   /blog/posts          (Admin/Staff)
PUT    /blog/posts/:slug    (Admin/Staff)
DELETE /blog/posts/:slug    (Admin)
```

---

## Database Schema Overview

Core models: `User` → `Profile`, `Address`, `BusinessClient`, `ApiKey`, `Webhook`, `Driver`, `Shipment`, `TrackingEvent`, `Payment`, `ProofOfDelivery`, `Notification`, `PromoCode`, `BlogPost`, `ServiceArea`, `BulkUpload`

View the full schema at [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)

---

## Tracking Number Format

```
TE-YYYYMMDD-XXXXXX
Example: TE-20260503-A7K2PQ
```

---

## Bulk Upload CSV Format

Required columns:

```csv
recipientEmail,pickupStreet,pickupCity,pickupRegion,deliveryStreet,deliveryCity,deliveryRegion,weight,serviceType,notes
customer@email.com,Bole Road 42,Addis Ababa,Addis Ababa,Main St 1,Dire Dawa,Dire Dawa,2.5,STANDARD,Fragile
```

A downloadable template is available at `/business/bulk-upload`.

---

## Environment Variables

### `packages/database/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/toloe_express"
```

### `apps/server/.env`

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="..."
JWT_SECRET="min-32-chars-secret"
JWT_REFRESH_SECRET="another-min-32-chars-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
UPLOAD_DIR="./uploads"

# Email (optional — falls back to Ethereal test SMTP in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="TOLLOE EXPRESS <noreply@toloeexpress.com>"

# SMS (optional stub)
AT_API_KEY=your-africastalking-key
AT_USERNAME=sandbox
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Production Deployment

### Build

```bash
pnpm build
```

### Database migration

```bash
pnpm --filter @repo/database db:migrate
```

### Server (PM2 example)

```bash
cd apps/server
pm2 start dist/index.js --name tolloe-api
```

### Frontend (Vercel / Docker)

```bash
cd apps/web
next start  # or build Docker image
```

### HTTPS

Use NGINX as a reverse proxy with Let's Encrypt certificates. Set `NODE_ENV=production` and `FRONTEND_URL=https://yourdomain.com`.

---

## Adding Features

### Add a new service area

```bash
# Via API
curl -X POST http://localhost:4000/api/v1/admin/service-areas \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"cityName":"Woldia","region":"Amhara","lat":11.8333,"lng":39.6}'
```

### Add a new language

1. Create `apps/web/src/i18n/[locale].json` with translations
2. Add locale to `next.config.ts` intl config

---

## License

Proprietary — TOLLOE EXPRESS © 2026. All rights reserved.
