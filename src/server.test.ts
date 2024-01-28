import { test, expect } from "vitest"

import { Player } from "./server/player"
import { Board  } from "./server/board"
import { Lobby  } from "./server/lobby"

import {
  Piece,
  Position,
  WinningLine,
  PlayerState,
  Event,
  AnyEvent,
  Command,
  UnexpectedError,
} from "./interface"

//-------------------------------------------------------------------------------------------------

const JAKE = "Jake"
const AMY  = "Amy"

//-------------------------------------------------------------------------------------------------

function mockClient() {
  const events: AnyEvent[] = []
  return {
    send: (event: AnyEvent) => {
      events.push(JSON.parse(JSON.stringify(event)) as AnyEvent)
    },
    events: () => events.splice(0),
    flush: () => events.splice(0)
  }
}

//-------------------------------------------------------------------------------------------------

function setup() {
  const client1 = mockClient()
  const client2 = mockClient()
  const lobby   = new Lobby()
  const player1 = new Player(client1)
  const player2 = new Player(client2)
  return {
    lobby,
    player1,
    player2,
    client1,
    client2,
    player: player1,
    client: client1,
  }
}

//-------------------------------------------------------------------------------------------------

test("place piece on board", () => {
  const board = new Board()

  expect(board.isOccupied(Position.TopLeft)).toEqual(false)
  expect(board.isOccupied(Position.Top)).toEqual(false)
  expect(board.isOccupied(Position.TopRight)).toEqual(false)
  expect(board.isOccupied(Position.Left)).toEqual(false)
  expect(board.isOccupied(Position.Center)).toEqual(false)
  expect(board.isOccupied(Position.Right)).toEqual(false)
  expect(board.isOccupied(Position.BottomLeft)).toEqual(false)
  expect(board.isOccupied(Position.Bottom)).toEqual(false)
  expect(board.isOccupied(Position.BottomRight)).toEqual(false)

  board.place(Position.TopLeft,     Piece.Dot)
  board.place(Position.TopRight,    Piece.Cross)
  board.place(Position.BottomLeft,  Piece.Cross)
  board.place(Position.BottomRight, Piece.Dot)

  expect(board.isOccupied(Position.TopLeft)).toEqual(Piece.Dot)
  expect(board.isOccupied(Position.Top)).toEqual(false)
  expect(board.isOccupied(Position.TopRight)).toEqual(Piece.Cross)
  expect(board.isOccupied(Position.Left)).toEqual(false)
  expect(board.isOccupied(Position.Center)).toEqual(false)
  expect(board.isOccupied(Position.Right)).toEqual(false)
  expect(board.isOccupied(Position.BottomLeft)).toEqual(Piece.Cross)
  expect(board.isOccupied(Position.Bottom)).toEqual(false)
  expect(board.isOccupied(Position.BottomRight)).toEqual(Piece.Dot)
})

//-------------------------------------------------------------------------------------------------

test("board winning lines", () => {
  const board = new Board()

  expect(board.hasWon(Piece.Cross)).toEqual(false)
  expect(board.hasWon(Piece.Dot)).toEqual(false)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.TopLeft,  Piece.Cross)
  board.place(Position.Top,      Piece.Cross)
  board.place(Position.TopRight, Piece.Cross)

  expect(board.hasWon(Piece.Cross)).toEqual(WinningLine.TopRow)
  expect(board.hasWon(Piece.Dot)).toEqual(false)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.Left,   Piece.Dot)
  board.place(Position.Center, Piece.Dot)
  board.place(Position.Right,  Piece.Dot)

  expect(board.hasWon(Piece.Cross)).toEqual(false)
  expect(board.hasWon(Piece.Dot)).toEqual(WinningLine.MiddleRow)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.BottomLeft,  Piece.Cross)
  board.place(Position.Bottom,      Piece.Cross)
  board.place(Position.BottomRight, Piece.Cross)

  expect(board.hasWon(Piece.Cross)).toEqual(WinningLine.BottomRow)
  expect(board.hasWon(Piece.Dot)).toEqual(false)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.TopLeft,    Piece.Dot)
  board.place(Position.Left,       Piece.Dot)
  board.place(Position.BottomLeft, Piece.Dot)

  expect(board.hasWon(Piece.Cross)).toEqual(false)
  expect(board.hasWon(Piece.Dot)).toEqual(WinningLine.LeftColumn)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.Top,    Piece.Cross)
  board.place(Position.Center, Piece.Cross)
  board.place(Position.Bottom, Piece.Cross)

  expect(board.hasWon(Piece.Cross)).toEqual(WinningLine.CenterColumn)
  expect(board.hasWon(Piece.Dot)).toEqual(false)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.TopRight,    Piece.Dot)
  board.place(Position.Right,       Piece.Dot)
  board.place(Position.BottomRight, Piece.Dot)

  expect(board.hasWon(Piece.Cross)).toEqual(false)
  expect(board.hasWon(Piece.Dot)).toEqual(WinningLine.RightColumn)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.TopLeft,     Piece.Cross)
  board.place(Position.Center,      Piece.Cross)
  board.place(Position.BottomRight, Piece.Cross)

  expect(board.hasWon(Piece.Cross)).toEqual(WinningLine.DownDiagonal)
  expect(board.hasWon(Piece.Dot)).toEqual(false)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.BottomLeft, Piece.Dot)
  board.place(Position.Center,     Piece.Dot)
  board.place(Position.TopRight,   Piece.Dot)

  expect(board.hasWon(Piece.Cross)).toEqual(false)
  expect(board.hasWon(Piece.Dot)).toEqual(WinningLine.UpDiagonal)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.TopLeft,     Piece.Cross)
  board.place(Position.Top,         Piece.Dot)
  board.place(Position.TopRight,    Piece.Dot)
  board.place(Position.Left,        Piece.Dot)
  board.place(Position.Center,      Piece.Cross)
  board.place(Position.Right,       Piece.Dot)
  board.place(Position.BottomLeft,  Piece.Dot)
  board.place(Position.Bottom,      Piece.Dot)
  board.place(Position.BottomRight, Piece.Cross)

  expect(board.hasWon(Piece.Cross)).toEqual(WinningLine.DownDiagonal)
  expect(board.hasWon(Piece.Dot)).toEqual(false)
  expect(board.isTie()).toEqual(false)

  board.reset()
  board.place(Position.TopLeft,     Piece.Cross)
  board.place(Position.Top,         Piece.Dot)
  board.place(Position.TopRight,    Piece.Cross)
  board.place(Position.Left,        Piece.Dot)
  board.place(Position.Center,      Piece.Cross)
  board.place(Position.Right,       Piece.Dot)
  board.place(Position.BottomLeft,  Piece.Dot)
  board.place(Position.Bottom,      Piece.Cross)
  board.place(Position.BottomRight, Piece.Dot)

  expect(board.hasWon(Piece.Cross)).toEqual(false)
  expect(board.hasWon(Piece.Dot)).toEqual(false)
  expect(board.isTie()).toEqual(true)
})

//-------------------------------------------------------------------------------------------------

test("2 players play a game, player1 wins", () => {

  const { lobby, client1, client2, player1, player2 } = setup()

  lobby.execute(player1, { type: Command.Join, name: JAKE })
  lobby.execute(player2, { type: Command.Join, name: AMY  })
  lobby.execute(player1, { type: Command.Turn, position: Position.Center   })
  lobby.execute(player2, { type: Command.Turn, position: Position.TopLeft  })
  lobby.execute(player1, { type: Command.Turn, position: Position.Left     })
  lobby.execute(player2, { type: Command.Turn, position: Position.TopRight })
  lobby.execute(player1, { type: Command.Turn, position: Position.Right    })

  expect(client1.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: JAKE, state: PlayerState.WaitingGame }
    },
    {
      type: Event.GameStarted,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Center,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.TopLeft,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Left,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.TopRight,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Right,
    },
    {
      type: Event.PlayerWon,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.Won  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.Lost },
      line: WinningLine.MiddleRow
    }
  ])

  expect(client2.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: AMY, state: PlayerState.WaitingGame }
    },
    {
      type: Event.GameStarted,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      position: Position.Center,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      position: Position.TopLeft,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      position: Position.Left,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      position: Position.TopRight,
    },
    {
      type: Event.OpponentTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Right,
    },
    {
      type: Event.PlayerLost,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.Won  },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.Lost },
      line: WinningLine.MiddleRow,
    }
  ])

})

//-------------------------------------------------------------------------------------------------

test("2 players play a game, player2 wins", () => {

  const { lobby, client1, client2, player1, player2 } = setup()

  lobby.execute(player1, { type: Command.Join, name: JAKE })
  lobby.execute(player2, { type: Command.Join, name: AMY  })
  lobby.execute(player1, { type: Command.Turn, position: Position.Center      })
  lobby.execute(player2, { type: Command.Turn, position: Position.TopLeft     })
  lobby.execute(player1, { type: Command.Turn, position: Position.Top         })
  lobby.execute(player2, { type: Command.Turn, position: Position.Left        })
  lobby.execute(player1, { type: Command.Turn, position: Position.BottomRight })
  lobby.execute(player2, { type: Command.Turn, position: Position.BottomLeft  })

  expect(client1.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: JAKE, state: PlayerState.WaitingGame }
    },
    {
      type: Event.GameStarted,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Center,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.TopLeft,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Top,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.Left,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.BottomRight,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.BottomLeft,
    },
    {
      type: Event.PlayerLost,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.Lost  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.Won },
      line: WinningLine.LeftColumn
    }
  ])

  expect(client2.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: AMY, state: PlayerState.WaitingGame }
    },
    {
      type: Event.GameStarted,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      position: Position.Center,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      position: Position.TopLeft,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      position: Position.Top,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      position: Position.Left,
    },
    {
      type: Event.OpponentTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.BottomRight,
    },
    {
      type: Event.PlayerTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.BottomLeft,
    },
    {
      type: Event.PlayerWon,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.Lost },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.Won  },
      line: WinningLine.LeftColumn,
    }
  ])
})

//-------------------------------------------------------------------------------------------------

test("2 players play a game, ends in a tie", () => {

  const { lobby, client1, client2, player1, player2 } = setup()

  lobby.execute(player1, { type: Command.Join, name: JAKE })
  lobby.execute(player2, { type: Command.Join, name: AMY  })
  lobby.execute(player1, { type: Command.Turn, position: Position.Center      })
  lobby.execute(player2, { type: Command.Turn, position: Position.TopLeft     })
  lobby.execute(player1, { type: Command.Turn, position: Position.Top         })
  lobby.execute(player2, { type: Command.Turn, position: Position.Bottom      })
  lobby.execute(player1, { type: Command.Turn, position: Position.TopRight    })
  lobby.execute(player2, { type: Command.Turn, position: Position.BottomLeft  })
  lobby.execute(player1, { type: Command.Turn, position: Position.Left        })
  lobby.execute(player2, { type: Command.Turn, position: Position.Right       })
  lobby.execute(player1, { type: Command.Turn, position: Position.BottomRight })

  expect(client1.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: JAKE, state: PlayerState.WaitingGame }
    },
    {
      type: Event.GameStarted,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Center,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.TopLeft,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Top,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.Bottom,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.TopRight,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.BottomLeft,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Left,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.Right,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.BottomRight,
    },
    {
      type: Event.PlayerTied,
      player:   { name: JAKE, piece: Piece.Cross, state: PlayerState.Tied },
      opponent: { name: AMY,  piece: Piece.Dot,   state: PlayerState.Tied },
    }
  ])

  expect(client2.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: AMY, state: PlayerState.WaitingGame }
    },
    {
      type: Event.GameStarted,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      position: Position.Center,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      position: Position.TopLeft,
    },
    {
      type: Event.OpponentTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      position: Position.Top,
    },
    {
      type: Event.PlayerTookTurn,
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      position: Position.Bottom,
    },
    {
      type: Event.OpponentTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.TopRight,
    },
    {
      type: Event.PlayerTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.BottomLeft,
    },
    {
      type: Event.OpponentTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.Left,
    },
    {
      type: Event.PlayerTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.TakingTurn  },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.WaitingTurn },
      position: Position.Right,
    },
    {
      type: Event.OpponentTookTurn,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.WaitingTurn },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.TakingTurn  },
      position: Position.BottomRight,
    },
    {
      type: Event.PlayerTied,
      opponent: { name: JAKE, piece: Piece.Cross, state: PlayerState.Tied },
      player:   { name: AMY,  piece: Piece.Dot,   state: PlayerState.Tied },
    }
  ])
})

//-------------------------------------------------------------------------------------------------

test("unexpected - player took turn in position that was already occupied", () => {

  const { lobby, client1, client2, player1, player2 } = setup()

  lobby.execute(player1, { type: Command.Join, name: JAKE })
  lobby.execute(player2, { type: Command.Join, name: AMY  })
  lobby.execute(player1, { type: Command.Turn, position: Position.Center })

  client1.flush()
  client2.flush()

  lobby.execute(player2, { type: Command.Turn, position: Position.Center })

  expect(client1.events()).toEqual([])
  expect(client2.events()).toEqual([
    {
      type: Event.UnexpectedError,
      error: UnexpectedError.PositionTaken,
    }
  ])
})

//-------------------------------------------------------------------------------------------------

test("unexpected - player played out of turn", () => {

  const { lobby, client1, client2, player1, player2 } = setup()

  lobby.execute(player1, { type: Command.Join, name: JAKE })
  lobby.execute(player2, { type: Command.Join, name: AMY  })

  client1.flush()
  client2.flush()

  lobby.execute(player2, { type: Command.Turn, position: Position.Center })

  expect(client1.events()).toEqual([])
  expect(client2.events()).toEqual([
    {
      type: Event.UnexpectedError,
      error: UnexpectedError.OutOfTurn,
    }
  ])
})

//-------------------------------------------------------------------------------------------------

test("unexpected - player took turn before starting game", () => {

  const { lobby, client, player } = setup()

  lobby.execute(player, { type: Command.Join, name: JAKE })

  client.flush()

  lobby.execute(player, { type: Command.Turn, position: Position.Center })

  expect(client.events()).toEqual([
    {
      type: Event.UnexpectedError,
      error: UnexpectedError.NotInGame,
    }
  ])
})

//-------------------------------------------------------------------------------------------------

test("unexpected - player tried to join lobby twice", () => {

  const { lobby, client, player } = setup()

  lobby.execute(player, { type: Command.Join, name: JAKE })

  client.flush()

  lobby.execute(player, { type: Command.Join, name: JAKE })

  expect(client.events()).toEqual([
    {
      type: Event.UnexpectedError,
      error: UnexpectedError.AlreadyJoined,
    }
  ])

  expect(lobby.numPlayers).toBe(1)
})

//-------------------------------------------------------------------------------------------------
