import { defineConfig } from "vite"

const clientPort = parseInt(process.env.CLIENT_PORT ?? "3000")
const clientHost = process.env.CLIENT_HOST ?? "localhost"
const serverPort = parseInt(process.env.SERVER_PORT ?? "3001")
const serverHost = process.env.SERVER_HOST ?? "localhost"

export default defineConfig({
  build: {
    target: "esnext"
  },
  server: {
    host: clientHost,
    port: clientPort,
    proxy: {
      "/ws": {
        target: `ws://${serverHost}:${serverPort}`,
        ws: true
      }
    }
  }
})
