import { defineConfig } from "vite"

const clientPort = parseInt(process.env.PORT ?? process.env.CLIENT_PORT ?? "3000")
const clientHost = process.env.HOST ?? process.env.CLIENT_HOST ?? "localhost"
const serverPort = parseInt(process.env.SERVER_PORT ?? `${clientPort+1}`)
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
