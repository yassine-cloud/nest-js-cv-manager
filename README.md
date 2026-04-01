# NestJS CV Manager

A simple NestJS project to manage CVs using Prisma (SQLite adapter).

## Prerequisites

- Node.js and npm installed

## Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client (models used by the app)

```bash
npx prisma generate
```

3. (Optional) Seed the database

```bash
npm run seed:cvs
```

## Run

- Start in development mode:

```bash
npm run start:dev
```

- Or start normally:

```bash
npm start
```

## Notes

- Ensure any required environment variables (for example `DATABASE_URL`) are set before running the app.

---
