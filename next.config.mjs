import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generate sitemap.xml and robots.txt automatically via app router (we'll add files for those)
  turbopack: {
    root: __dirname,
  },
  watchOptions: {
    pollIntervalMs: 1000,
  },
}

export default nextConfig
