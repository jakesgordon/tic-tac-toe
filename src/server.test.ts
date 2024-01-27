import { test, expect } from "vitest"
import { Board } from "./server"

import {
  Piece,
  Position,
  WinningLine
} from "./interface"

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
