import { WebSocket, WebSocketServer } from "ws"

import { Player } from "./server/player"
import { Lobby  } from "./server/lobby"

import {
  Command,
  AnyCommand,
  AnyEvent,
} from "./interface"

//-------------------------------------------------------------------------------------------------

const clientPort = parseInt(process.env.PORT ?? process.env.CLIENT_PORT ?? "3000")
const serverPort = parseInt(process.env.SERVER_PORT ?? `${clientPort+1}`)

const wss   = new WebSocketServer({ port: serverPort })
const lobby = new Lobby()

//-------------------------------------------------------------------------------------------------

wss.on("connection", (ws: WebSocket) => {

  const player = new Player({
    send: (event: AnyEvent) => {
      console.log("EVENT", JSON.parse(JSON.stringify(event)))
      ws.send(JSON.stringify(event))
    }
  })

  ws.on("message", (data: Buffer) => {
    try {
      const command = JSON.parse(data.toString()) as AnyCommand
      console.log("COMMAND", command)
      lobby.execute(player, command)
    } catch (err) {
      console.error("GAME ERROR", err)
    }
  })

  ws.on("close", () => {
    try {
      const command = { type: Command.Leave } as AnyCommand
      console.log("COMMAND", command)
      lobby.execute(player, command)
    } catch (err) {
      console.error("GAME ERROR", err)
    }
  })

  ws.on("error", (err) => {
    console.error("UNEXPECTED CONNECTION ERROR", err)
  })
})

console.log("LISTENING ON PORT: ", serverPort)

//-------------------------------------------------------------------------------------------------

if (import.meta.hot) { // - vite-node HMR - https://github.com/vitest-dev/vitest/issues/2334
  import.meta.hot.on("vite:beforeFullReload", () => {
    wss.close()
  })
}

//-------------------------------------------------------------------------------------------------
