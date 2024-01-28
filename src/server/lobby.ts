import { assert } from "../assert"
import { Player } from "./player"
import { Board  } from "./board"

import {
  Position,
  Piece,
  PlayerState,
  Command,
  Event,
  AnyCommand,
  UnexpectedError,
} from "../interface"

//-------------------------------------------------------------------------------------------------

export class Lobby {
  private players = new Set<Player>()

  get numPlayers() {
    return this.players.size
  }

  execute(player: Player, command: AnyCommand) {
    switch(command.type) {
    case Command.Join:   return this.join(player, command.name)
    case Command.Turn:   return this.turn(player, command.position)
    case Command.Leave:  return this.leave(player)
    case Command.Replay: return this.replay(player)
    }
    assert.unreachable(command)
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

//-------------------------------------------------------------------------------------------------
