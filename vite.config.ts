import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app from /<repo>/, so everything is built relative to
// that base. Override with BASE_PATH when deploying elsewhere.
const base = process.env.BASE_PATH ?? '/necromunda-app/'

// Absolute public URL, needed for canonical and social-card tags. The deploy
// workflow derives it from the repository so a rename needs no code change.
const siteUrl = process.env.SITE_URL ?? `https://lukehmu.github.io${base}`

/** Copy shared by the HTML head, social cards and the PWA manifest. */
const site = {
  name: 'Necromunda Gang Tracker',
  shortName: 'Necromunda',
  title: 'Necromunda Gang Tracker: wounds, activations and injuries',
  description:
    "Free, offline tracker for games of Necromunda. Follow every fighter's wounds, activation, suppression, ammo and injuries turn by turn, right from your phone.",
  themeColor: '#0f0e0d',
}

/** schema.org description, so search results can show it as a free web app. */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: site.name,
  url: siteUrl,
  description: site.description,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript.',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
}

/**
 * Fills `%SITE_*%` placeholders in index.html. Attribute values are HTML
 * escaped; the JSON-LD block is not (script content is never entity-decoded),
 * so it is serialised separately with `<` escaped to keep `</script>` out.
 */
function siteMeta(): Plugin {
  const values: Record<string, string> = {
    SITE_URL: siteUrl,
    SITE_NAME: site.name,
    SITE_TITLE: site.title,
    SITE_DESCRIPTION: site.description,
    SITE_THEME_COLOR: site.themeColor,
  }
  const jsonLd = JSON.stringify(structuredData).replaceAll('<', '\\u003c')
  const escapeAttr = (value: string) =>
    value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      return html
        .replace('%SITE_JSON_LD%', jsonLd)
        .replace(/%(SITE_[A-Z_]+)%/g, (match, key: string) =>
          key in values ? escapeAttr(values[key]) : match,
        )
    },
  }
}

export default defineConfig({
  base,
  plugins: [
    siteMeta(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The social card is only ever fetched by link unfurlers, never offline.
        globIgnores: ['**/og-image.png'],
        navigateFallback: `${base}index.html`,
      },
      manifest: {
        name: site.name,
        short_name: site.shortName,
        description: site.description,
        lang: 'en',
        categories: ['games', 'utilities'],
        theme_color: site.themeColor,
        background_color: site.themeColor,
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
