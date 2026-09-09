// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
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
    server: {
      host: true,
      allowedHosts: true
    }
  }
});
