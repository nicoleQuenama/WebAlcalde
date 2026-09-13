// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // SSR con páginas estáticas prerenderizadas donde se pueda.
  // `export const prerender = true` en cada página estática evita render en cada request.
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  // Prefetch + View Transitions: navegación SPA sin reload.
  // viewport = precarga al entrar en viewport (más rápido que hover), hover como refuerzo.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  experimental: {
    clientPrerender: true,
  },

  integrations: [
    react({
      experimentalReactChildren: true,
    }),
  ],

  // Optimización de imágenes remotas del bucket de Supabase (resize + webp en build).
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fsuxvbuupswucnsvrdce.supabase.co' },
    ],
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@lib': path.resolve('./src/lib'),
        '@components': path.resolve('./src/components'),
        '@hooks': path.resolve('./src/hooks'),
        '@constants': path.resolve('./src/constants'),
        '@utils': path.resolve('./src/utils'),
        '@types': path.resolve('./src/types'),
        '@styles': path.resolve('./src/styles'),
        '@assets': path.resolve('./src/assets'),
        '@pages': path.resolve('./src/pages'),
        '@layouts': path.resolve('./src/layouts'),
      },
    },
    build: {
      // Code splitting para que el JS no sea un monolito
      cssCodeSplit: true,
    },
    server: {
      host: true,
      allowedHosts: true,
    },
  },
});
