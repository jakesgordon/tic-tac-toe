import { Position } from "../interface"

export class Board extends HTMLElement {
  board: HTMLElement
  cells: Record<Position, HTMLElement>

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
