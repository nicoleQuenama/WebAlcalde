# Datos — esquema, dominios y seed

## Conexión

La única persistencia es **PostgreSQL** vía la variable `DATABASE_URL`
(obligatoria). Se usa el pool `pg` de `src/lib/db.ts` (máx. 10 conexiones).

```bash
# uso local (PostgreSQL 18, base webalcalde)
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/webalcalde
```

## Tablas

La primera vez que se usa el servidor se crean con `CREATE TABLE IF NOT EXISTS`
(`asegurarTabla*` en `db.ts`). No hay migrate tool aún: cambios de esquema se
hacen a mano y conviene revisarlo a futuro.

### `contenido`
Contenido editorial. La fila es una porción JSON de un dominio.

| columna | tipo | nota |
| :--- | :--- | :--- |
| `dominio` | TEXT | agrupa filas (clave única con `clave`) |
| `clave` | TEXT | id de la fila dentro del dominio |
| `orden` | INTEGER | para listas ordenadas |
| `data` | TEXT | JSON con el contenido en sí |

### `buzon`
Mensajes del Buzón Ciudadano.

| columna | tipo | nota |
| :--- | :--- | :--- |
| `id` | TEXT | UUID, PK |
| `nombre` | TEXT | remitente |
| `tipo` | TEXT | `sugerencia` \| `felicitacion` |
| `mensaje` | TEXT | texto del mensaje |
| `creado_en` | TEXT | ISO 8601 |

### `usuario` / `sesion`
Autenticación del panel. Ver `docs/ADMIN-DESPLIEGUE.md`.

`usuario`: `usuario` (TEXT PK), `pass_hash` (bcrypt cost 12), `creado_en`.

`sesion`: `token` (TEXT PK, 32 bytes aleatorios), `usuario`, `creado_en`,
`expira_en` (12 h deslizantes).

## Dominios del seed

`src/lib/db.ts` arranca y si el dominio está vacío, guarda su `data`:
`capitulo`, `era`, `seccion` (el temario de `/gestion`), `gestion_hero`,
`proyectos_titulo`, `proyecto`, `historia_intro`, `filtro`, `hito` (línea de
tiempo de `/sobre`). Los arranques posteriores son idempotentes: no se
sobrescriben los datos ya guardados.

Getters expuestos (`db.ts`): `getCapitulos`, `getEras`, `getSecciones`,
`getGestionHero`, `getProyectoTitulo`, `getProyectos`, `getHistoriaIntro`,
`getFiltros`, `getHitos` (+ `estaVacio` interno).

## Leer/guardar desde el código

```ts
import {
  guardar, leer, contar,
  crearMensaje, listarMensajes,
  crearUsuario, obtenerUsuario, crearSesion, obtenerSesion,
  eliminarSesion, renovarSesion, asegurarAdministrador,
} from '@lib/db';
```

`guardar(dominio, clave, data, orden)` hace UPSERT en `contenido`;
`leer(dominio)` devuelve las filas ordenadas por `orden` y parsea el JSON.

## Reset

Para regenerar el contenido desde el seed (Postgres local):

```sql
TRUNCATE contenido, buzon, usuario, sesion RESTART IDENTITY;
```

luego reiniciar el servidor. (También sirve para arrancar con el buzón y la
cuenta admin limpios.)