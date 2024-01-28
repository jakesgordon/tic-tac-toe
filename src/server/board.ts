import {
  Position,
  Piece,
  WinningLine,
} from "../interface"

//-------------------------------------------------------------------------------------------------

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

//-------------------------------------------------------------------------------------------------
