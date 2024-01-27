import { defineConfig } from "vite"

const port = parseInt(process.env.CLIENT_PORT ?? "3000")
const host = process.env.CLIENT_HOST ?? "0.0.0.0"

export default defineConfig({
  build: {
    target: "esnext"
  },
  server: {
    host: host,
    port: port,
  }
})
