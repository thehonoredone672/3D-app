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
export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsConfig,
  },
  preview: {
    https: httpsConfig,
  },
})
