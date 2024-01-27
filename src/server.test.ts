import { test, expect } from "vitest"
import { Player, Board, Lobby } from "./server"

import {
  Piece,
  Position,
  WinningLine,
  PlayerState,
  Event,
  AnyEvent,
  Command,
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

  expect(client1.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: JAKE, state: PlayerState.WaitingGame }
    },
  ])

  expect(client2.events()).toEqual([
    {
      type: Event.PlayerReady,
      player: { name: AMY, state: PlayerState.WaitingGame }
    },
  ])

})

//-------------------------------------------------------------------------------------------------
