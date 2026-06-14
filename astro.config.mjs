// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';


import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  image: {
    domains: ['gorgeous-dinosaur-03b8830672.media.strapiapp.com'],
    remotePatterns: [{ protocol: 'http' }, { protocol: 'https' }]
  },

  adapter: vercel({
    imageService: true
  })
});