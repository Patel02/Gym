# Federation Gym

Federation Gym is a powerlifting federation platform built with Next.js, TypeScript, PostgreSQL, and Prisma.

## Stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS 4
- Prisma 7 with PostgreSQL
- Auth.js credentials authentication
- Resend for transactional email and Inngest for background jobs
- UploadThing for authenticated file uploads

## Getting started

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env` and set at least `DATABASE_URL`.
3. Install dependencies: `npm ci`.
4. For a new local database only, apply the schema with `npx prisma db push`.
5. Start the development server with `npm run dev`.

Open [http://localhost:3000](http://localhost:3000).

Do not use `prisma db push` against production. Apply reviewed database migrations in production.

## Environment variables

Required for the corresponding features:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js session signing secret; generate a unique secret for each environment |
| `APP_URL` | Public base URL used for generated links |
| `RESEND_API_KEY` | Resend API key for application email |
| `RESEND_FROM_EMAIL` | Verified sender, for example `Federation <noreply@example.com>` |
| `REFEREE_INVITE_CODE` | Private invitation code for referee registration |
| `UPLOADTHING_TOKEN` | UploadThing server credentials |
| `SUPERADMIN_SETUP_KEY` | One-time setup key required by the first-super-admin page |
| `STRIPE_*`, `RAZORPAY_*` | Optional payment provider credentials and webhook secrets |

Keep `.env` and deployment secrets private. If a real secret has been exposed, revoke and rotate it in its provider dashboard; replacing it in the local file alone is not sufficient.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run setup:superadmin` | Create or update the super-admin account from environment variables |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma studio` | Open Prisma Studio |

Installing dependencies runs `prisma generate` automatically.

For super-admin setup, set `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` in the local environment first. Set `SUPERADMIN_NAME` optionally. Never pass a password as a command-line argument.

## Project layout

```text
prisma/                 Database schema and Prisma configuration
scripts/                One-time administrative and maintenance scripts
public/                 Static assets
src/app/                Next.js routes, layouts, and route handlers
src/actions/             Server Actions
src/components/          UI grouped by product area
src/data/                Static product and reference data
src/inngest/             Background job definitions and client
src/lib/                 Shared server utilities, Prisma, validation, and calculations
src/styles/              Global CSS and Tailwind theme
src/types/               Shared TypeScript declarations
src/auth.ts              Auth.js server configuration
src/proxy.ts             Next.js 16 request redirects (not an authorization boundary)
```

Server Actions and Route Handlers must perform their own authentication, authorization, and input validation. Proxy redirects are only a navigation layer and must not be relied on to protect data or mutations.
