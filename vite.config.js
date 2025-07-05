import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    outDir: 'dist',
    // emit an HTML‑report with bundle sizes (debug)
    reportCompressedSize: true,
    vendorCache: true,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // --- Heavy UI libs ---
          if (id.includes('@mui')) return 'mui'
          if (id.includes('@fullcalendar')) return 'calendar'
          if (id.includes('filepond')) return 'filepond'
          if (id.includes('swiper')) return 'swiper'
          if (id.includes('react-player')) return 'reactPlayer'

          // --- Animations ---
          if (id.includes('gsap')) return 'gsap'
          if (id.includes('lottie-react')) return 'lottie'

          // --- Misc big bundles ---
          if (id.includes('react-icons')) return 'icons'

          // let Vite handle the rest (react, supabase, query, etc.)
        },
      },
    },
  },

  base: '/', // GitHub Pages deployment
})
