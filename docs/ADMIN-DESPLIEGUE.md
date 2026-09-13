# Admin y despliegue

## Panel de administración

Rutas bajo `src/pages/admin/`:

| Ruta | Función | Protección |
| :--- | :--- | :--- |
| `/admin` | Índice con accesos (editor, buzón, salir) | requiere sesión (`/admin/login` si no hay) |
| `/admin/login` | Formulario de login | — |
| `/admin/<ADMIN_SECRET_PATH>` | Editor CMS (beta) | sesión **+** que el path coincida con `ADMIN_SECRET_PATH` |
| `/admin/buzon/<ADMIN_SECRET_PATH>` | Lista de mensajes del Buzón | sesión **+** path secreto |

### Variables de entorno

| Var | Uso |
| :--- | :--- |
| `ADMIN_SECRET_PATH` | Segmento secreto de `/admin/*`. Sin ella, `/admin/*` da 404. **Obligatoria.** |
| `ADMIN_USER` | Usuario del panel (default `admin`) |
| `ADMIN_PASSWORD` | Contraseña; se hashea con bcrypt (cost 12) en la primera sesión |
| `COOKIE_SECURE` | `true` **solo** en producción con HTTPS (cookie `Secure`); `false` en local HTTP |

> `ADMIN_PASSWORD` nunca se guarda en claro: al primer acceso se crea el hash en
> la tabla `usuario`. Para cambiar la clave, cambiá la var y borrá la fila de
> `usuario` (o corré el TRUNCATE de `docs/DATOS.md`).

### Login — cómo funciona

1. `POST /api/auth/login` recibe el form (`Content-Type: application/x-www-
   form-urlencoded`).
2. Si la cuenta `ADMIN_USER` no existe en `usuario`, la crea con el hash de
   `ADMIN_PASSWORD`.
3. Compara el hash bcrypt. Errores genéricos (no revelan si el usuario existe) y
   **rate-limit de 5 intentos fallidos / 15 min por IP** (ante el fallo redirige
   a `?error=bloqueado`).
4. Éxito: crea una **sesión opaca** — token aleatorio de 32 bytes guardado en
   `sesion` y cookie `cocha_admin` `HttpOnly` + `SameSite=Strict`, expiración
   deslizante de 12 h (se renueva con cada petición válida).
5. `GET /api/auth/sesion` da el estado (para que la UI muestre logout).
   `POST /api/auth/logout` destruye la sesión y limpia la cookie.

Las APIs del admin (`/api/admin/init/[pagina]`, `/api/admin/contenido/[dominio]`)
exigen sesión **y** el header `X-Admin-Secret` con `ADMIN_SECRET_PATH`.

### Editor CMS: estado REAL

El editor es un **prototipo en memoria** (`src/lib/cms/store.ts`): los cambios
se aplican a las páginas solo mientras el proceso de Node corre y **se pierden
al reiniciar**. No escribe a Postgres. No lo uses como editor de producción
todavía; sirve para probar la UX de edición.

## Buzón Ciudadano

`POST /api/buzon` valida y persiste en `buzon`:

- honeypot anti-bots (campo oculto),
- rate-limit por IP: 1 envío cada **2 s** y máx. **10 por hora**,
- filtro de malas palabras server-side (`src/lib/buzon/palabras.ts`),
- longitud y formato razonables.

La lista está en `/admin/buzon/<ADMIN_SECRET_PATH>` (protegida por sesión).

## Despliegue

### Docker (lo recomendado para compartir)

```bash
cp .env.example .env      # opcional: personalizá claves / admin
docker compose up --build # arma Postgres + app y siembra el contenido
# → http://localhost:4321
```

- `db` corre Postgres 18 con un **volumen** persistente (`pgdata`); la app
  espera el healthcheck antes de arrancar.
- La `DATABASE_URL` del contenedor apunta al servicio `db` (esto sobreescribe el
  `.env` local; el `.env` se usa para `ADMIN_*`, `POSTGRES_*` y `COOKIE_SECURE`).
- El contenido se siembra solo (ver `docs/DATOS.md`).
- Todo lo sensible entra **en runtime** (no se hornea en la imagen).

A mano, sin compose:

```bash
docker build -t webalcalde .
docker run --rm -p 4321:4321 --env-file .env webalcalde
```

### Producción (notas)

- El adapter es `@astrojs/node` **standalone**: el arranque es
  `node dist/server/entry.mjs` (lee `HOST` y `PORT`).
- Con HTTPS real (proxy front, p. ej. Nginx/Caddy/Cloudflare) poné
  `COOKIE_SECURE=true` y un dominio propio para el panel.
- `DATABASE_URL` puede apuntar a cualquier Postgres (Supabase-managed, RDS,
  VPS...) **sin cambios de código**: es la única vía de datos.
- Generá un `ADMIN_SECRET_PATH` largo (ej. `openssl rand -hex 16`) y una
  `ADMIN_PASSWORD` fuerte. No uses los defaults del `.env.example`.
- **Backups:** el único estado mutable es Postgres (contenido, buzón, usuario,
  sesiones). Un `pg_dump` periódico alcanza; la media ya está en Supabase.

## Verificaciones rápidas

```bash
npm run build        # compila a dist/
node ./dist/server/entry.mjs   # sirve en http://localhost:4321
```

- `/`, `/sobre`, `/gestion`, `/buzon` → 200.
- `/admin` sin sesión → redirect a `/admin/login`.
- Login con `ADMIN_USER` / `ADMIN_PASSWORD` → llega al índice del panel.
- `npx astro check` → 19 errores de tipos preexistentes (ver
  `docs/ARQUITECTURA.md`); el objetivo es no sumar ninguno.