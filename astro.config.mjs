// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // SSR: cada request se renderiza en el servidor Node (dist/server/entry.mjs).
  // Las páginas que no necesiten datos frescos pueden marcar
  // `export const prerender = true` para volver a ser estáticas.
  output: 'server',
  adapter: node({ mode: 'standalone' }),

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
    server: {
      host: true,
      allowedHosts: true,
    },
  },
});
