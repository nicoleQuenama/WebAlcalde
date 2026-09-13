# WebAlcalde

Sitio institucional construido con **Astro** (SSR) e islas de **React**.

## Stack

| Pieza | Detalle |
| :--- | :--- |
| Framework | Astro 7 — `output: server`, adapter `@astrojs/node` (standalone) |
| UI interactiva | React 19 (islas), GSAP, three.js / react-three-fiber |
| Estilos | Tailwind CSS 4 (vía `@tailwindcss/vite`) |
| Contenido | PostgreSQL (vía `DATABASE_URL`, local o administrado) — ver `src/lib/db.ts` |
| Media | Imágenes y videos en un bucket de Supabase Storage — ver `src/lib/media.ts` |

Cada request se renderiza en el servidor Node, así que el contenido se lee **en
cada visita** (no queda congelado en el build). Una página que no necesite datos
frescos puede volver a ser estática con `export const prerender = true`.

## Requisitos

- **Node.js ≥ 22.12**
- **PostgreSQL** (18 o compatible) — los scripts de localhost asumen uno corriendo

## Puesta en marcha

```bash
npm install                  # instala dependencias
cp .env.example .env         # completá DATABASE_URL (OBLIGATORIO)
npm run dev                  # servidor de desarrollo en http://localhost:4321
```

El contenido editorial (textos, temario, hitos, proyectos) se **siembra solo** la
primera vez que se compila o se levanta el dev server, a partir del seed que vive
en `src/lib/db.ts`. Postgres es la fuente de verdad; para regenerar desde cero,
vacias la tabla `contenido` (y `buzon` / `usuario` / `sesion` si querés arrancar
limpio) y volvés a compilar.

## Comandos

Todos se ejecutan desde la raíz del proyecto:

| Comando | Acción |
| :--- | :--- |
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` (hot reload) |
| `npm run build` | Compila a `./dist/` (`dist/server/` + `dist/client/`) |
| `npm run preview` | Corre el servidor Node de `./dist/` localmente |
| `node ./dist/server/entry.mjs` | Arranca el server SSR (lee `HOST` y `PORT`) |
| `npm run astro -- --help` | Ayuda de la CLI de Astro |

## Estructura

```text
src/
├── pages/        # una ruta por archivo .astro (index, sobre, gestion, buzon)
├── layouts/      # Layout.astro — cáscara HTML común
├── components/   # componentes .astro y .tsx (Header, Historia, Home, Book…)
├── hooks/        # hooks de React (contenido, multimedia, mazos de cards)
├── lib/          # db.ts (Postgres), auth.ts, media.ts (Supabase), cms/
├── constants/    # config estática (navbar…)
├── styles/       # CSS por página / global
└── types/        # tipos TS compartidos
public/           # assets servidos tal cual (favicon, cocha.jpg)
```

Astro expone cada `.astro` de `src/pages/` como ruta según su nombre de archivo.
Los componentes `.tsx` son islas: se hidratan en el cliente solo con directivas
`client:*`.

## Docker

El stack dockerizado incluye **Postgres + la app SSR** en un solo comando, ideal
para compartir el proyecto:

```bash
cp .env.example .env        # opcional: personalizá credenciales / admin
docker compose up --build   # http://localhost:4321
```

- El servicio `db` corre Postgres 18 con un volumen persistente (`pgdata`) y
  healthcheck; la app espera su señal de healthy antes de arrancar.
- La `DATABASE_URL` del contenedor `web` apunta al servicio `db` de la red de
  Compose (el `.env` local se sobreescribe con ese valor).
- Todo lo sensible (claves, `ADMIN_SECRET_PATH`, admin) se pasa **en runtime**,
  nunca se hornea en la imagen.

Imagen a mano:

```bash
docker build -t webalcalde .
docker run --rm -p 4321:4321 --env-file .env webalcalde
```

## Documentación

La doc vive en `docs/`:

- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) — diagrama y flujo de datos
- [docs/DATOS.md](docs/DATOS.md) — esquema y estrategia de seed
- [docs/MEDIA.md](docs/MEDIA.md) — bucket de Supabase y pipeline de media
- [docs/ADMIN-DESPLIEGUE.md](docs/ADMIN-DESPLIEGUE.md) — admin, login y deploy