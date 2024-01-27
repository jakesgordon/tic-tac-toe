import { test, expect } from "vitest"
import { Board } from "./server"

import {
  Piece,
  Position
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
