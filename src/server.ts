import { WebSocket, WebSocketServer } from "ws"

import {
  Position,
  Piece,
  Command,
  Event,
  AnyCommand,
  AnyEvent
} from "./interface"

//=================================================================================================
// PLAYER
//=================================================================================================

interface Client {
  send: (event: AnyEvent) => void
}

export class Player {
  client: Client

  constructor(client: Client) {
    this.client = client
  }

  send(event: AnyEvent) {
    this.client.send(event)
  }
}

//=================================================================================================
// BOARD
//=================================================================================================

export class Board {
  private cells!: Record<Position, Piece | undefined>

  constructor() {
    this.reset()
  }

  reset() {
    this.cells = {
      [Position.TopLeft]:     undefined,
      [Position.Top]:         undefined,
      [Position.TopRight]:    undefined,
      [Position.Left]:        undefined,
      [Position.Center]:      undefined,
      [Position.Right]:       undefined,
      [Position.BottomLeft]:  undefined,
      [Position.Bottom]:      undefined,
      [Position.BottomRight]: undefined,
    }
  }

  place(position: Position, piece: Piece) {
    this.cells[position] = piece
  }

  isOccupied(position: Position) {
    return this.cells[position] ?? false
  }

}

//=================================================================================================
// LOBBY
//=================================================================================================

export class Lobby {
  private players = new Set<Player>()

  get numPlayers() {
    return this.players.size
  }

  execute(player: Player, command: AnyCommand) {
    switch(command.type) {
    case Command.Ping: return this.pong(player)
    }
  }

  private pong(player: Player) {
    player.send({
      type: Event.Pong,
    })
  }
}

//=================================================================================================
// WEB SOCKET SERVER
//=================================================================================================

const port  = parseInt(process.env.SERVER_PORT ?? process.env.PORT ?? "3001")
const wss   = new WebSocketServer({ port })
const lobby = new Lobby()

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
    console.log("TODO: player left the game")
  })

  ws.on("error", (err) => {
    console.error("UNEXPECTED CONNECTION ERROR", err)
  })
})

console.log("LISTENING ON PORT: ", port)

//-------------------------------------------------------------------------------------------------

if (import.meta.hot) { // - vite-node HMR - https://github.com/vitest-dev/vitest/issues/2334
  import.meta.hot.on("vite:beforeFullReload", () => {
    wss.close()
  })
}

//-------------------------------------------------------------------------------------------------
