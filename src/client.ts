import topbar from "topbar"
import {
  Command,
  AnyCommand,
  Event,
  AnyEvent,
  PongEvent,
} from "./interface"

//=================================================================================================
// TYPES
//=================================================================================================

type Sender = (command: AnyCommand) => void

//=================================================================================================
// GAME LOGIC
//=================================================================================================

class Game {
  private send: Sender

  constructor(send: Sender) {
    this.send = send
    const button = document.getElementById("ping") as HTMLButtonElement
    button.addEventListener("click", () => {
      console.log("PING!")
      this.send({ type: Command.Ping })
    })
  }

  onPong(event: PongEvent) {
    console.log("PONG!", event)
  }
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
      case Event.Pong: return game.onPong(event)
      }
    })
  })
}

await connect(`ws://${location.host}/ws`)

//-------------------------------------------------------------------------------------------------
