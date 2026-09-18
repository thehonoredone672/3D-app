import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const keyPath = path.resolve(dirname, '../certs/dev.key')
const certPath = path.resolve(dirname, '../certs/dev.crt')
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath)
const httpsConfig = hasCerts
  ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  : undefined

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project from https://<user>.github.io/3D-app/,
  // not the domain root, so built asset URLs need the repo name as a prefix.
  // Local dev keeps serving from '/'.
  base: command === 'build' ? '/3D-app/' : '/',
  plugins: [react()],
  server: {
    https: httpsConfig,
  },
  preview: {
    https: httpsConfig,
  },
}))
