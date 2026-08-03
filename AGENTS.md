<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CONTEXT: J_web (Elevators Transport)
DOMAIN: Vertical Transport / Colombia
LANG: ES (UI, Docs, Code Comments)

## TECH_STACK
FRAMEWORK: Next.js 16.2.4 (AppRouter) + React 19.2.4 (MODIFIED: check node_modules/next/dist/docs/)
CSS: Tailwind v4 (@tailwindcss/postcss, NO tailwind.config.js). Theme: zinc-950/900, cyan-400, backdrop-blur.
DB: MongoDB + Prisma 4 (@prisma/client, prisma-client-js).
AUTH: Custom Cookie-based (bcryptjs). NO JWT/NextAuth.
STORAGE: Cloudflare R2 (@aws-sdk/client-s3).
PDF: pdfkit.
ICONS: lucide-react.

## ARCHITECTURE & RULES
- STRATEGY: API/Data is Server-Side. "use client" STRICTLY for interactive UI.
- DB_CLIENT: Singleton PrismaClient (src/lib/prisma.js).
- DB_SCHEMA: Map `id` -> `_id` (@db.ObjectId).
- SECURITY: Environment variables (.env, .env.local) required for DB/R2. DO NOT EXPOSE, LOG, OR COMMIT SECRETS.
- SOURCE_OF_TRUTH: `src/app/dashboard/README.md` & `FICHA_TECNICA_GUIDE.md` dictate dashboard logic.
- IGNORE: `venv/` (Python).

## AUTH_MODEL
- METHOD: Email-based cookie session.
- NORMALIZATION: email (lowercase/trim), role (uppercase).
- ROLES: CLIENTE (Read-only), EMPRESA (Full CRUD).
- MIDDLEWARE: `src/lib/auth.js` -> `getSessionUser()`, `requireEnterpriseRole()` (Returns 403 if !EMPRESA).

## DATA_MODEL (MongoDB)
User: { id, email: Unique, password: Hashed, role: Enum[CLIENTE, EMPRESA], name, building, equipment: Rel[] }
Equipment: { id, userId: FK, internalCode: Unique, type, motorBrand, controlBrand, cableType, cableGauge, maxWeight, capacity, reportUrls: String[] /* 12 max/monthly */, FichaTecnica: Rel 1:1 }
FichaTecnica: { equipmentId: Unique, Specs[motor, cables, cabin, doors, safety], timestamps }
Project: { id, title, description, imageUrl }

## API_ROUTES (src/app/api/*)
/login: [POST] Auth/Set Cookie
/logout: [POST] Clear Cookie
/session: [GET] Validate User
/register-client: [POST]
/equipment: [GET, POST, PUT, DELETE]
/ficha-tecnica: [GET, POST, PUT]
/cliente: [GET, PUT, DELETE, POST]
/report: [GET, POST]
/report/generate: [POST] (pdfkit -> R2)
/upload: [POST]
/storage: [POST]
/project: [GET, POST, PUT, DELETE]
/projects: [GET, POST] (Public)

## SCRIPTS (package.json)
dev: npm run dev
build: npm run build
start: npm run start
lint: npm run lint
seed: node prisma/seed.js
trim_users: npm run trim:users (Req: .env + .env.local via --env-file)
reset_reports: npm run reset:reports
cleanup_r2: npm run cleanup:r2:reports
