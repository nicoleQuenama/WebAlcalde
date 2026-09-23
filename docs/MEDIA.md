# Media — bucket de Supabase Storage

## Dónde está

Las imágenes y videos viven en un bucket público llamado **`media`** del
proyecto Supabase `fsuxvbuupswucnsvrdce.supabase.co`. La base de la URL se
hardcodea en `src/lib/media.ts`:

```
https://xfkfvabjxgfwjktaxhcs.supabase.co/storage/v1/object/public/media/<carpeta>/<archivo>
```

`media.ts` expone la constante `MEDIA` con las URLs ya armadas y los datos de
encuadre/optimización de cada imagen. No hay cliente de Supabase en runtime:
solo se construyen URLs públicas.

## Estructura de carpetas del bucket

| Carpeta | Contenido |
| :--- | :--- |
| `imagenes/raiz/` | fotos sueltas (`.webp`), incluido el logo `LOGO ALCALDE.webp` |
| `imagenes/recursos-graficos-home/` | gráficos del home (`.webp`), logo firma, etc. |
| `imagenes/cocha-antes-y-ahora/` | pares antes/después (con subcarpeta `ahora/`) |
| `imagenes/premios-manfred/` | reconocimientos del perfil institucional |
| `videos/` | videos (QR del temario y similares) |

Convenciones de `media.ts`: `raiz` y `home` siempre agregan `.webp`; las demás
carpetas llevan el nombre completo del archivo.

## Cómo se consumen

1. `src/lib/media.ts` arma la URL pública + los datos de encuadre/ajuste.
2. Las páginas las pasan a `astro:assets` para optimizar sin deformar
   (width/height reales + encuadre en `src/lib/ajusteImagen.ts`).
3. El navegador descarga la imagen directamente del bucket de Supabase.

## Pipeline de carga (script de una vez)

El proyecto trae `convertir/` con scripts (`.mjs`) que procesan las fotos
locales y **suben** al bucket (ej. `upload-nuevo-material.mjs`), usando su
propio `.env` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Ese script no
forma parte del runtime de la app.

## Estado conocido

- El bucket **está lleno** (límite de storage del plan gratuito). Por ahora no
  se migra la media: el sitio la sirve tal como está. Opciones a futuro si se
  quiere:
  - migrar a otro object storage (R2/GCS/S3) y cambiar el `BASE` de `media.ts`,
  - comprimir y re-subir los archivos más pesados,
  - subir el plan del proyecto Supabase.
- En general, el patrón "media en object storage + Postgres aparte" es el
  correcto: el límite de storage de Supabase **no afecta** a la base de datos.

## Nota

`public/cocha.jpg` (portada del libro) es local, no está en el bucket.