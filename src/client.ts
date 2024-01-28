import topbar from "topbar"
import { assert } from "./assert"
import { Header, JoinEvent } from "./client/header"
import { Board, Dot, Cross, TurnEvent } from "./client/board"

import {
  Position,
  PlayerState,
  Command,
  AnyCommand,
  Event,
  AnyEvent,
  PlayerReadyEvent,
  GameStartedEvent,
  PlayerTookTurnEvent,
  OpponentTookTurnEvent,
  OpponentAbandonedEvent,
  PlayerWonEvent,
  PlayerLostEvent,
  PlayerTiedEvent,
  UnexpectedError,
} from "./interface"

//=================================================================================================
// CUSTOM ELEMENTS
//=================================================================================================

customElements.define("ttt-dot",    Dot)
customElements.define("ttt-cross",  Cross)
customElements.define("ttt-header", Header)
customElements.define("ttt-board",  Board)

//=================================================================================================
// TYPES
//=================================================================================================

type Sender = (command: AnyCommand) => void

//=================================================================================================
// GAME LOGIC
//=================================================================================================

class Game {
  private send:   Sender
  private header: Header
  private board:  Board

  constructor(send: Sender) {
    this.send   = send
    this.header = document.getElementById("header") as Header
    this.board  = document.getElementById("board")  as Board
    this.header.addEventListener("join", (ev) => this.onJoin((ev as JoinEvent).detail.name))
    this.header.addEventListener("replay", () => this.onReplay())
    this.board.addEventListener("turn", (ev) => this.onTurn((ev as TurnEvent).detail.position))
  }

  onJoin(name: string) {
    this.send({ type: Command.Join, name })
  }

  onReplay() {
    this.send({ type: Command.Replay })
  }

  onPlayerReady({ player }: PlayerReadyEvent) {
    this.header.reset(player)
    this.board.reset()
  }

  onGameStarted({ player, opponent }: GameStartedEvent) {
    assert.isPiece(player.piece)
    this.header.start(player, opponent)
    this.board.start(player.piece, player.state === PlayerState.TakingTurn)
  }

  onTurn(position: Position) {
    this.send({ type: Command.Turn, position })
  }

  onPlayerTookTurn({ player, position }: PlayerTookTurnEvent) {
    assert.isPiece(player.piece)
    this.board.set(position, player.piece, false)
    this.header.update(player)
  }

  onOpponentTookTurn({ player, opponent, position }: OpponentTookTurnEvent) {
    assert.isPiece(opponent.piece)
    this.board.set(position, opponent.piece, true)
    this.header.update(player)
  }

  onOpponentAbandoned({ player }: OpponentAbandonedEvent) {
    this.board.abandon()
    this.header.end(player)
  }

  onPlayerWon({ player, line }: PlayerWonEvent) {
    assert.isPiece(player.piece)
    this.board.win(line, player.piece)
    this.header.end(player)
  }

  onPlayerLost({ player, opponent, line }: PlayerLostEvent) {
    assert.isPiece(opponent.piece)
    this.board.win(line, opponent.piece)
    this.header.end(player)
  }

  onPlayerTied({ player }: PlayerTiedEvent) {
    this.header.end(player)
  }

  onError(error: UnexpectedError) {
    console.error(error)
  }
}

//=================================================================================================
// UTILITY METHODS
//=================================================================================================

export function show(el: HTMLElement, display = true) {
  if (display) {
    el.classList.remove("hidden")
  } else {
    el.classList.add("hidden")
  }
}

export function hide(el: HTMLElement) {
  show(el, false)
}

//=================================================================================================
// WEBSOCKET CONNECTION
//=================================================================================================

function connect(url: string): Promise<Game> {
  return new Promise((resolve) => {
    const socket = new WebSocket(url)

    const send: Sender = (command: AnyCommand) => {
      topbar.show()
      console.log("COMMAND", command)
      socket.send(JSON.stringify(command))
    }

    const game = new Game(send)

    socket.addEventListener("open", () => {
      console.log("CONNECTED TO", socket.url)
      resolve(game)
    })

    socket.addEventListener("close", (event) => {
      console.log("DISCONNECTED", event.code)
    })

    socket.addEventListener("message", (message: MessageEvent) => {
      topbar.hide()
      const event = JSON.parse(message.data as string) as AnyEvent
      console.log("EVENT", event)
      switch(event.type) {
      case Event.PlayerReady:       return game.onPlayerReady(event)
      case Event.GameStarted:       return game.onGameStarted(event)
      case Event.PlayerTookTurn:    return game.onPlayerTookTurn(event)
      case Event.OpponentTookTurn:  return game.onOpponentTookTurn(event)
      case Event.OpponentAbandoned: return game.onOpponentAbandoned(event)
      case Event.PlayerWon:         return game.onPlayerWon(event)
      case Event.PlayerLost:        return game.onPlayerLost(event)
      case Event.PlayerTied:        return game.onPlayerTied(event)
      case Event.UnexpectedError:   return game.onError(event.error)
      }
      assert.unreachable(event)
    })
  })
}

const protocol = location.protocol === "https:" ? "wss" : "ws"
await connect(`${protocol}://${location.host}/ws`)

//-------------------------------------------------------------------------------------------------
