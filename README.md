# WebAlcalde

Sitio institucional construido con **Astro** (SSR) e islas de **React**.

## Stack

| Pieza | Detalle |
| :--- | :--- |
| Framework | Astro 7 — `output: server`, adapter `@astrojs/node` (standalone) |
| UI interactiva | React 19 (islas), GSAP, three.js / react-three-fiber |
| Estilos | Tailwind CSS 4 (vía `@tailwindcss/vite`) |
| Contenido | SQLite (`data/webalcalde.db`) leída con `node:sqlite` — ver `src/lib/db.ts` |
| Media | Imágenes y videos en un bucket de Supabase — ver `src/lib/media.ts` |

Cada request se renderiza en el servidor Node, así que el contenido se lee **en
cada visita** (no queda congelado en el build). Una página que no necesite datos
frescos puede volver a ser estática con `export const prerender = true`.

## Requisitos

- **Node.js ≥ 22.12** (usa `node:sqlite`, incluido en Node moderno sin flags)
- npm

## Puesta en marcha

```bash
npm install        # instala dependencias
npm run dev        # servidor de desarrollo en http://localhost:4321
```

El contenido editorial (textos, temario, hitos, proyectos) se **siembra solo** en
`data/webalcalde.db` la primera vez que se compila o se levanta el dev server,
a partir del seed que vive en `src/lib/db.ts`. Esa base es la fuente de verdad;
si querés regenerarla desde cero, borrá `data/webalcalde.db` y volvé a compilar.

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
├── pages/        # una ruta por archivo .astro (index, sobre, gestion)
├── layouts/      # Layout.astro — cáscara HTML común
├── components/   # componentes .astro y .tsx (Header, Historia, Home, Book…)
├── hooks/        # hooks de React (contenido, multimedia, mazos de cards)
├── lib/          # db.ts (SQLite), media.ts (Supabase), ajusteImagen.ts
├── constants/    # config estática (navbar…)
├── styles/       # CSS por página / global
└── types/        # tipos TS compartidos
public/           # assets servidos tal cual (favicon, cocha.jpg)
```

Astro expone cada `.astro` de `src/pages/` como ruta según su nombre de archivo.
Los componentes `.tsx` son islas: se hidratan en el cliente solo con directivas
`client:*`.

## Estado actual

> `src/pages/about/about.astro` y `src/pages/gestion/gestion.astro` son duplicados
> de `sobre.astro` / `gestion.astro` con rutas de import a un nivel de más (`../`
> donde va `../../`). En SSR el build no falla, pero esas rutas (`/about/about`,
> `/gestion/gestion`) no deberían existir. Conviene eliminarlas:
>
> ```bash
> git rm -r src/pages/about src/pages/gestion/gestion.astro
> ```

## Docker

Imagen de producción multi-stage: la etapa 1 compila, la etapa 2 corre el
servidor Node SSR como usuario sin privilegios. Ver `Dockerfile`.

```bash
cp .env.example .env      # completá las credenciales de Supabase
docker compose up --build # http://localhost:4321
```

o a mano:

```bash
docker build -t webalcalde .
docker run --rm -p 4321:4321 --env-file .env webalcalde
```

Las credenciales de Supabase/Postgres se pasan **en runtime** (`env_file` /
`--env-file`), nunca se hornean en la imagen.

## Documentación

[docs.astro.build](https://docs.astro.build)
