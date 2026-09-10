# syntax=docker/dockerfile:1

# =============================================================================
#  WebAlcalde — imagen de producción (SSR)
#  Astro con adapter @astrojs/node (standalone). La etapa 1 compila;
#  la etapa 2 corre el servidor Node que renderiza cada request.
# =============================================================================

ARG NODE_IMAGE=node:24-alpine

# =============================================================================
#  Etapa 1 — dependencias + build
#    node:sqlite viene incluido en Node 24 sin flags (lo usa src/lib/db.ts).
# =============================================================================
FROM ${NODE_IMAGE} AS build

ENV NODE_ENV=production

WORKDIR /app

# Dependencias — capa cacheable mientras package-lock.json no cambie.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Código y compilación → /app/dist (dist/server + dist/client)
COPY . .
RUN npm run build

# Deja solo las dependencias necesarias en runtime.
RUN npm prune --omit=dev

# =============================================================================
#  Etapa 2 — runtime (servidor Node)
# =============================================================================
FROM ${NODE_IMAGE} AS runtime

LABEL org.opencontainers.image.title="WebAlcalde" \
      org.opencontainers.image.description="Sitio Astro (SSR) servido por Node"

# Config del adapter standalone: escucha en 0.0.0.0:4321.
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

WORKDIR /app

# Carpeta writable para la DB de contenido que siembra src/lib/db.ts.
# (cuando el contenido pase a Postgres/fetch, esto deja de usarse)
RUN mkdir -p /app/data && chown -R node:node /app

# Artefacto SSR + dependencias de runtime, como usuario sin privilegios.
COPY --from=build --chown=node:node /app/dist         ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 4321
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4321)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
