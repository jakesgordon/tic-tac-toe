import {
  Piece,
  PlayerState,
  Event,
  AnyEvent,
  UnexpectedError,
} from "../interface"

import { Board } from "./board"

//-------------------------------------------------------------------------------------------------

interface Client {
  send: (event: AnyEvent) => void
}

//-------------------------------------------------------------------------------------------------

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

//-------------------------------------------------------------------------------------------------
