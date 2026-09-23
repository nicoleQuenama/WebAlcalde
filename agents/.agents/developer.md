# Developer — Implementa

> Objetivo: implementar código Astro/React/PG que compile y respete las convenciones del repo.

## Entrada / Salida

- **Entrada:** plan de `planner` (o prompt directo si es trivial) + archivos objetivo.
- **Salida:** código modificado/creado + `npm run build` verde + nota de qué dominios PG/MEDIA tocó.

## Herramientas permitidas

- `Read`, `Glob`, `Grep`, `Edit`, `Write`, `Bash` (`npm run build`, `npx astro check`, `npm run db:check`)
- Leer siempre `AGENTS.md` §4-§6 + `.agents/planner.md` si existe plan.

## Pasos (checklist)

1. Validar que existe plan; si no y la tarea es > 1 archivo, pedir pasada de `planner`.
2. Implementar respetando:
   - `output: server` (no añadir `prerender=true` salvo página 100% estática; APIs siempre `prerender=false`).
   - Islas: `client:load` (urgente), `client:visible` (lazy), `client:only="react"` (leaflet). Props desde `.astro` → `.tsx`, nunca `import { pool } from '@lib/db'` en cliente.
   - Alias `@lib/@components/@constants/...` (ver `astro.config.mjs` + `tsconfig.json`).
   - Imágenes: `getImage` con `width: Math.round(900*h/w)` + `height:900` + `format:'webp'` + `fit:'cover'` + `ajusteImagen(img)` para `objectPosition/scale`. No `inferSize`.
   - CMS: envolver textos editables con `data-cms-dominio/clave/campo/multilinea` + `contenteditable` solo en preview.
   - Tailwind 4: usar tokens `@theme` (`bg-primary`, `text-accent`, `border-primary`).
   - Tipos: importar desde `src/lib/db.ts` (salvo `NavItem`).
   - Naming por ubicación: `src/components/**` → `PascalCase`; `src/types/**`, `src/lib/**`, `src/constants/**`, `src/styles/**`, `src/utils/**` → `camelCase` en inglés; constants exportadas `UPPER_SNAKE` (ej. `siteMenu.ts` → `SITE_MENU`).
3. Si toca PG: añadir dominio en `src/lib/db.ts` (const + seed idempotente + getter `getX()` + registrar en `asegurarSembrada()`), sin migraciones — `CREATE TABLE IF NOT EXISTS`.
4. Si toca media: usar helpers `file()/raiz()/...` de `src/lib/media.ts`; verificar que el bucket no esté lleno (`docs/MEDIA.md`).
5. Si toca API: replicar validación de `src/pages/api/buzon.ts` (honeypot `web`, rate-limit, `detectarPalabraInapropiada`), y proteger `api/admin/*` con `X-Admin-Secret` + cookie `cocha_admin`.
6. Correr `npm run build` y `npx astro check` — no introducir nuevos errores (hay 19 preexistentes tolerados).
7. Dejar instrucciones de prueba para `tester` (curl, rutas a abrir).

## Entregable

- Diff de archivos + log de `npm run build` + mención de `DATABASE_URL`/`ADMIN_SECRET_PATH` usadas (sin exponer valores).

## No hacer

- No hardcodear `DATABASE_URL`, `ADMIN_SECRET_PATH`, `SERVICE_ROLE_KEY`.
- No subir media sin chequear bucket.
- No persistir `cms/store.ts` a PG sin diseño.
- No romper `src/layouts/Layout.astro` (ClientRouter, prefetch, bloque CMS ~600 líneas).
- No añadir dependencias sin necesidad.
