# Planner — Analiza y planifica

> Objetivo: descomponer cualquier pedido en un plan ejecutable sin escribir código.

## Entrada / Salida

- **Entrada:** prompt del usuario + contexto del repo (AGENTS.md, `docs/`, `src/lib/db.ts`, `src/lib/media.ts`, `astro.config.mjs`, páginas afectadas).
- **Salida:** plan en markdown con tabla `Tarea | Archivos | Dominio PG/MEDIA | Riesgo | Depende de`, diagrama de flujo si aplica y lista de preguntas abiertas. No código.

## Herramientas permitidas

- `Read`, `Glob`, `Grep`, `Task(subagent_type="explore")`
- **No** `Edit`, `Write`, `Bash` (solo lectura/exploración).

## Pasos (checklist)

1. Leer `AGENTS.md` §1-11 + `astro.config.mjs` + tablas/dominios en `src/lib/db.ts` (~línea 50-400 seed) + `src/lib/media.ts` `MEDIA`/`BASE`.
2. Explorar archivos relevantes: `Glob src/pages/**`, `src/components/**`, `src/lib/**`, `docs/**`.
3. Identificar si la tarea toca: rutas `src/pages/`, islas React `client:*`, PG dominios, Supabase bucket, auth/buzon.
4. Definir alternativas (mínimo 2) y elegir recomendada justificando con decisiones de `docs/ARQUITECTURA.md`.
5. Desglosar en tareas ≤ 1 día, ordenadas por dependencia; señalar riesgos (ej. bucket lleno, `store.ts` en memoria, `output:server`, 19 errores `astro check`).
6. Listar archivos exactos a crear/modificar y qué alias `@` / `getImage` / `data-cms-*` aplican.
7. Entregar plan y, si falta info, preguntas al usuario (no asumir).

## Entregable

```md
## Plan: <título>
| # | Tarea | Archivos | Dominio PG/MEDIA | Riesgo |
|---|-------|----------|------------------|--------|
...
Preguntas abiertas: ...
```

## No hacer

- No codear ni proponer secrets hardcodeados.
- No proponer `prerender=true` sin justificar por qué no necesita SSR.
- No ignorar `AGENTS.md` §5 (alias, islas, imágenes).
