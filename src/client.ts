import topbar from "topbar"
import { assert } from "./assert"
import { Header, JoinEvent } from "./client/header"

import {
  Command,
  AnyCommand,
  Event,
  AnyEvent,
  PongEvent,
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

customElements.define("ttt-header", Header)

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

  constructor(send: Sender) {
    this.send   = send
    this.header = document.getElementById("header") as Header
    this.header.addEventListener("join", (ev) => this.onJoin((ev as JoinEvent).detail.name))
  }

  onPong(event: PongEvent) {
    console.log(event)
  }

  onJoin(name: string) {
    this.send({ type: Command.Join, name })
  }

  onPlayerReady({ player }: PlayerReadyEvent) {
    this.header.reset(player)
  }

  onGameStarted(event: GameStartedEvent) {
    console.log("TODO", event)
  }

  onPlayerTookTurn(event: PlayerTookTurnEvent) {
    console.log("TODO", event)
  }

  onOpponentTookTurn(event: OpponentTookTurnEvent) {
    console.log("TODO", event)
  }

  onOpponentAbandoned(event: OpponentAbandonedEvent) {
    console.log("TODO", event)
  }

  onPlayerWon(event: PlayerWonEvent) {
    console.log("TODO", event)
  }

  onPlayerLost(event: PlayerLostEvent) {
    console.log("TODO", event)
  }

  onPlayerTied(event: PlayerTiedEvent) {
    console.log("TODO", event)
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
      case Event.Pong:              return game.onPong(event)
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

await connect(`ws://${location.host}/ws`)

//-------------------------------------------------------------------------------------------------
