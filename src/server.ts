import { WebSocket, WebSocketServer } from "ws"

import {
  Position,
  Piece,
  WinningLine,
  PlayerState,
  Command,
  Event,
  AnyCommand,
  AnyEvent,
  UnexpectedError,
} from "./interface"

//=================================================================================================
// PLAYER
//=================================================================================================

interface Client {
  send: (event: AnyEvent) => void
}

export class Player {
  client:    Client
  name:      string
  state:     PlayerState
  board?:    Board
  opponent?: Player
  piece?:    Piece

  constructor(client: Client) {
    this.client = client
    this.name   = Player.DefaultName
    this.state  = PlayerState.Joining
  }

  send(event: AnyEvent) {
    this.client.send(event)
  }

  error(error: UnexpectedError) {
    this.send({
      type: Event.UnexpectedError,
      error,
    })
  }

  join(name: string) {
    this.name  = name
    this.reset()
  }

  reset() {
    this.state    = PlayerState.WaitingGame
    this.board    = undefined
    this.opponent = undefined
    this.piece    = undefined
  }

  start(board: Board, opponent: Player, piece: Piece, state: PlayerState.TakingTurn | PlayerState.WaitingTurn) {
    this.state    = state
    this.board    = board
    this.opponent = opponent
    this.piece    = piece
  }

  takingTurn()  { this.state = PlayerState.TakingTurn  }
  waitingTurn() { this.state = PlayerState.WaitingTurn }
  won()         { this.state = PlayerState.Won         }
  lost()        { this.state = PlayerState.Lost        }
  tied()        { this.state = PlayerState.Tied        }
  abandoned()   { this.state = PlayerState.Abandoned   }

  toJSON() {
    return {
      name:  this.name,
      state: this.state,
      piece: this.piece,
    }
  }

  static DefaultName = "Anonymous"
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

  hasWon(piece: Piece) {
    if (this.cells[Position.TopLeft] === piece && this.cells[Position.Top] === piece && this.cells[Position.TopRight] === piece)
      return WinningLine.TopRow
    if (this.cells[Position.Left] === piece && this.cells[Position.Center] === piece && this.cells[Position.Right] === piece)
      return WinningLine.MiddleRow
    if (this.cells[Position.BottomLeft] === piece && this.cells[Position.Bottom] === piece && this.cells[Position.BottomRight] === piece)
      return WinningLine.BottomRow
    if (this.cells[Position.TopLeft] === piece && this.cells[Position.Left] === piece && this.cells[Position.BottomLeft] === piece)
      return WinningLine.LeftColumn
    if (this.cells[Position.Top] === piece && this.cells[Position.Center] === piece && this.cells[Position.Bottom] === piece)
      return WinningLine.CenterColumn
    if (this.cells[Position.TopRight] === piece && this.cells[Position.Right] === piece && this.cells[Position.BottomRight] === piece)
      return WinningLine.RightColumn
    if (this.cells[Position.TopLeft] === piece && this.cells[Position.Center] === piece && this.cells[Position.BottomRight] === piece)
      return WinningLine.DownDiagonal
    if (this.cells[Position.BottomLeft] === piece && this.cells[Position.Center] === piece && this.cells[Position.TopRight] === piece)
      return WinningLine.UpDiagonal
    return false
  }

  isFull() {
    return Object.entries(this.cells).every(([_key, value]) => value !== undefined)
  }

  isTie() {
    return this.isFull()
      && !this.hasWon(Piece.Cross)
      && !this.hasWon(Piece.Dot)
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
    case Command.Ping:   return this.pong(player)
    case Command.Join:   return this.join(player, command.name)
    case Command.Turn:   return this.turn(player, command.position)
    case Command.Leave:  return this.leave(player)
    case Command.Replay: return this.replay(player)
    }
  }

  private pong(player: Player) {
    player.send({
      type: Event.Pong,
    })
  }

  private join(player: Player, name: string) {
    if (player.state !== PlayerState.Joining)
      return player.error(UnexpectedError.AlreadyJoined)
    player.join(name)
    this.players.add(player)
    this.ready(player)
  }

  private ready(player: Player) {
    player.send({
      type: Event.PlayerReady,
      player: player,
    })
    this.start(player)
  }

  private start(player: Player) {
    const opponent = this.findOpponent(player)
    if (opponent) {
      const board = new Board()

      opponent.start(board, player,   Piece.Cross, PlayerState.TakingTurn)
      player.start(board,   opponent, Piece.Dot,   PlayerState.WaitingTurn)

      player.send({
        type: Event.GameStarted,
        player: player,
        opponent,
      })
      opponent.send({
        type: Event.GameStarted,
        player: opponent,
        opponent: player,
      })
    }
  }

  private turn(player: Player, position: Position) {
    const board    = player.board
    const opponent = player.opponent

    if (!board || !opponent || !player.piece || !opponent.piece)
      return player.error(UnexpectedError.NotInGame)
    else if (player.state !== PlayerState.TakingTurn)
      return player.error(UnexpectedError.OutOfTurn)
    else if (board.isOccupied(position))
      return player.error(UnexpectedError.PositionTaken)

    board.place(position, player.piece)

    player.waitingTurn()
    opponent.takingTurn()

    player.send({
      type: Event.PlayerTookTurn,
      player,
      opponent,
      position,
    })
    opponent.send({
      type: Event.OpponentTookTurn,
      player: opponent,
      opponent: player,
      position,
    })

    const line = board.hasWon(player.piece)
    if (line) {
      player.won()
      opponent.lost()

      player.send({
        type: Event.PlayerWon,
        player,
        opponent,
        line
      })
      opponent.send({
        type: Event.PlayerLost,
        player: opponent,
        opponent: player,
        line
      })
    }

    if (board.isTie()) {
      player.tied()
      opponent.tied()

      player.send({
        type: Event.PlayerTied,
        player,
        opponent,
      })
      opponent.send({
        type: Event.PlayerTied,
        player: opponent,
        opponent: player,
      })
    }
  }

  private replay(player: Player) {
    player.reset()
    this.ready(player)
  }

  private leave(player: Player) {
    const opponent = player.opponent
    if (opponent) {
      opponent.abandoned()
      opponent.send({
        type: Event.OpponentAbandoned,
        player: opponent,
        opponent: player
      })
    }
    this.players.delete(player)
  }

  private findOpponent(player: Player) {
    for (const other of this.players.values()) {
      if ((other.state === PlayerState.WaitingGame) && (other !== player))
        return other
    }
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

console.log("LISTENING ON PORT: ", port)

//-------------------------------------------------------------------------------------------------

if (import.meta.hot) { // - vite-node HMR - https://github.com/vitest-dev/vitest/issues/2334
  import.meta.hot.on("vite:beforeFullReload", () => {
    wss.close()
  })
}

//-------------------------------------------------------------------------------------------------
