# Arquitectura — WebAlcalde

> Sitio institucional **Astro 7 (SSR)** con islas React, contenido editorial en
> **PostgreSQL** y media en **Supabase Storage**. Toda la doc vive en esta
> carpeta; el README del repo enlaza acá.

## Diagrama

Renderizá el `.puml` con PlantUML (https://www.plantuml.com/plantuml/ uml/
`<url-encoded>`), en VSCode con la extensión PlantUML o con `docker run
plantuml/plantuml`).

```plantuml
@startuml
!theme plain

skinparam componentStyle rectangle
skinparam monochrome true

left to right direction

actor "Visitante" as Navegador
actor "Admin" as Admin

package "Cliente" {
  Navegador
}

package "Servidor Node (Adapter SSR standalone, dist/server)" {
  component [Astro pages\n(/ , /sobre, /gestion,\n/buzon, /noticias)] as Pages
  component [Contenido: db.ts\npool pg + seed] as DB
  component [Auth: lib/auth.ts\nsessions + bcrypt] as Auth
  component [CMS editor\nstore en memoria] as CMS
  component [APIs\n/api/buzon\n/api/auth/*\n/api/admin/*] as API
}

package "Almacenamiento" {
  database [PostgreSQL\ndb: webalcalde\n(tablas contenido,\nbuzon, usuario, sesion)] as PG
  cloud [Supabase Storage\nbucket: media (definido en\nsrc/lib/media.ts)] as STORAGE
}

Navegador --> Pages
Pages --> DB : getters (getCapitulos,\ngetEras, ...)
DB --> PG : pool pg (DATABASE_URL)
Pages --> STORAGE : src en src/lib/media.ts\n(URLs públicas)\n<img src="https://.../media/...">

Admin --> Pages : /admin (login)
Pages --> Auth
Auth --> DB
DB --> PG
Admin --> CMS : /admin/<ADMIN_SECRET_PATH>\neditor (honra el secreto)
CMS ..> Pages : overrides de lectura\n(en memoria, beta)
CMS ..> API : api/admin/*\n(sesion + X-Admin-Secret)
API --> CMS
API --> DB : /api/buzon (lib/buzon\nvalida, filtra, rate-limit)
DB --> PG
Navegador --> API : POST /api/buzon

note bottom of CMS
  El editor es un PROTOTIPO: los
  cambios viven en memoria y se
  pierden al reiniciar el proceso.
  No persiste a PostgreSQL.
end note

note bottom of DB
  Sin DATABASE_URL el servidor NO
  arranca (no hay fallback). El seed
  siembra contenido solo si la tabla
  `contenido` está vacía.
end note

@enduml
```

Simplificado: el **contenido editorial** (textos, temario, hitos, proyectos) vive
en Postgres y se lee en cada request; la **media** (fotos y videos) vive en el
bucket público de Supabase y las URLs se arman en `src/lib/media.ts`.

## Flujo de datos

1. **Contenido:** las páginas llaman a los getters de `src/lib/db.ts`
   (`getCapitulos`, `getEras`, ...). `db.ts` consulta Postgres vía `pg` Pool.
   Si la tabla `contenido` está vacía, ejecuta el seed (idempotente).
2. **Media:** las páginas usan `MEDIA` (de `src/lib/media.ts`), que expone URLs
   públicas hardcodeadas del bucket `media` (`https://<proyecto>.supabase.co/
   storage/v1/object/public/media/...`) y datos de encuadre para optimizarlas
   con `astro:assets` sin deformar.
3. **Buzón Ciudadano:** `POST /api/buzon` valida el form (honeypot + rate-limit
   por IP + filtro de malas palabras en `src/lib/buzon/palabras.ts`) y guarda en
   la tabla `buzon`.
4. **Admin:** `/admin/login` (bcrypt contra la tabla `usuario`), sesiones
   opacas en cookie (`cocha_admin`), y detrás de `/admin/<ADMIN_SECRET_PATH>` el
   editor del CMS (beta, en memoria) y la lista del buzón.

## Decisiones de diseño

| Tema | Decisión | Por qué |
| :--- | :--- | :--- |
| Persistencia | PostgreSQL única (sin fallback) | Una sola fuente de verdad; sin ramas de código muertas. `DATABASE_URL` es obligatoria. |
| Media | Object storage (Supabase Storage) | Correcto separar archivos grandes de la DB. Sirve igual aunque el Postgres cambie de proveedor. |
| Contenido | Cada request lee la DB | Siempre fresco; no se congela en el build. |
| Editor CMS | **Prototipo en memoria** | Se probó la UX; aún no persiste. Documentado explícitamente para no confundirlo con producción. |
| Auth | bcrypt (cost 12) + sesiones opacas en DB | Contraseña nunca en claro; sesión revocable y con expiración deslizante. |
| Despliegue | Docker Compose (app + Postgres) + `/bin/sh` npm run build | Un comando reproduce el stack completo para compartir. |

## Huecos conocidos (conscientes)

- El editor del CMS no persiste cambios (beta en memoria).
- El bucket de Supabase está lleno; no se migra la media por ahora.
- `npx astro check` reporta 19 errores de tipos preexistentes en
  `index.astro`, `gestion.astro`, `Institutional.component.astro`,
  `ComparatingProjects/index.astro` y `editorApp.ts` (fuera de alcance).
- Sin migrate tool para el esquema: las tablas se crean con `CREATE TABLE IF
  NOT EXISTS` al primer uso. Ideal a futuro: usar un sistema de migraciones.