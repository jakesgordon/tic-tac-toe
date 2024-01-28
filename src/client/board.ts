import { Piece, Position, WinningLine } from "../interface"

const MY_TURN = "my-turn"

export class TurnEvent extends CustomEvent<{ position: Position }> {}

export class Board extends HTMLElement {
  board: HTMLElement
  cells: Record<Position, HTMLElement>
  winningLines: Record<WinningLine, HTMLElement>

  constructor() {
    super()
    const template = document.getElementById("ttt-board") as HTMLTemplateElement
    this.appendChild(template.content.cloneNode(true))
    this.board = this.querySelector(".board") as HTMLElement

    this.cells = {
      [Position.TopLeft]:     this.querySelector(".board-cell.top-left")     as HTMLElement,
      [Position.Top]:         this.querySelector(".board-cell.top")          as HTMLElement,
      [Position.TopRight]:    this.querySelector(".board-cell.top-right")    as HTMLElement,
      [Position.Left]:        this.querySelector(".board-cell.left")         as HTMLElement,
      [Position.Center]:      this.querySelector(".board-cell.center")       as HTMLElement,
      [Position.Right]:       this.querySelector(".board-cell.right")        as HTMLElement,
      [Position.BottomLeft]:  this.querySelector(".board-cell.bottom-left")  as HTMLElement,
      [Position.Bottom]:      this.querySelector(".board-cell.bottom")       as HTMLElement,
      [Position.BottomRight]: this.querySelector(".board-cell.bottom-right") as HTMLElement,
    }

    this.winningLines = {
      [WinningLine.TopRow]:       this.querySelector(".winning-line.top-row")       as HTMLElement,
      [WinningLine.MiddleRow]:    this.querySelector(".winning-line.middle-row")    as HTMLElement,
      [WinningLine.BottomRow]:    this.querySelector(".winning-line.bottom-row")    as HTMLElement,
      [WinningLine.LeftColumn]:   this.querySelector(".winning-line.left-column")   as HTMLElement,
      [WinningLine.CenterColumn]: this.querySelector(".winning-line.center-column") as HTMLElement,
      [WinningLine.RightColumn]:  this.querySelector(".winning-line.right-column")  as HTMLElement,
      [WinningLine.DownDiagonal]: this.querySelector(".winning-line.down-diagonal") as HTMLElement,
      [WinningLine.UpDiagonal]:   this.querySelector(".winning-line.up-diagonal")   as HTMLElement,
    }

    for (const [position, cell] of Object.entries(this.cells)) {
      cell.addEventListener("click", () => {
        if (this.board.classList.contains(MY_TURN) && !cell.classList.contains(Piece.Dot) && !cell.classList.contains(Piece.Cross)) {
          this.dispatchEvent(new TurnEvent("turn", {
            detail: {
              position: position as Position,
            },
          }))
        }
      })
    }
  }

  start(piece: Piece, myTurn: boolean) {
    this.board.classList.add(piece)
    if (myTurn)
      this.board.classList.add(MY_TURN)
    else
      this.board.classList.remove(MY_TURN)
  }

  set(position: Position, piece: Piece, myTurn: boolean) {
    this.cells[position].classList.add(piece)
    if (myTurn)
      this.board.classList.add(MY_TURN)
    else
      this.board.classList.remove(MY_TURN)
  }

  win(line: WinningLine, piece: Piece) {
    this.winningLines[line].classList.add(piece)
    this.board.classList.remove(MY_TURN)
  }

  abandon() {
    this.board.classList.remove(MY_TURN)
  }

  reset() {
    this.board.classList.remove(Piece.Dot)
    this.board.classList.remove(Piece.Cross)
    this.board.classList.remove(MY_TURN)
    for (const position of Object.values(Position)) {
      this.cells[position].classList.remove(Piece.Dot)
      this.cells[position].classList.remove(Piece.Cross)
    }
    for (const line of Object.values(WinningLine)) {
      this.winningLines[line].classList.remove(Piece.Dot)
      this.winningLines[line].classList.remove(Piece.Cross)
    }
  }
}

//-------------------------------------------------------------------------------------------------

export class Dot extends HTMLElement {
  constructor() {
    super()
    const template = document.getElementById("ttt-dot") as HTMLTemplateElement
    this.appendChild(template.content.cloneNode(true))
  }
}

export class Cross extends HTMLElement {
  constructor() {
    super()
    const template = document.getElementById("ttt-cross") as HTMLTemplateElement
    this.appendChild(template.content.cloneNode(true))
  }
}

//-------------------------------------------------------------------------------------------------
