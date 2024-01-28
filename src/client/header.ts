import { assert } from "../assert"
import { Piece, Player, PlayerState } from "../interface"
import { show, hide } from "../client"

export class JoinEvent extends CustomEvent<{ name: string }> {}

export class Header extends HTMLElement {

  form:    HTMLFormElement
  details: HTMLElement

  constructor () {
    super()
    const template = document.getElementById("ttt-header") as HTMLTemplateElement
    this.appendChild(template.content.cloneNode(true))
    this.form    = this.querySelector(".header-form") as HTMLFormElement
    this.details = this.querySelector(".header-details") as HTMLElement
  }

  connectedCallback() {
    this.form.addEventListener("submit", this)
    this.nameInput.addEventListener("input", this)
  }

  disconnectedCallback() {
    this.form.removeEventListener("submit", this)
    this.nameInput.removeEventListener("input", this)
  }

  get nameInput()     { return this.querySelector(".header-name-input") as HTMLInputElement }
  get joinButton()    { return this.querySelector(".header-join-button") as HTMLButtonElement }
  get status()        { return this.querySelector(".header-status") as HTMLElement  }
  get opponent()      { return this.querySelector(".header-opponent") as HTMLElement }
  get playerName()    { return this.querySelector(".header-player-name") as HTMLElement }
  get playerDot()     { return this.querySelector(".header-player-dot") as HTMLElement }
  get playerCross()   { return this.querySelector(".header-player-cross") as HTMLElement }
  get opponentName()  { return this.querySelector(".header-opponent-name") as HTMLElement }
  get opponentDot()   { return this.querySelector(".header-opponent-dot") as HTMLElement }
  get opponentCross() { return this.querySelector(".header-opponent-cross") as HTMLElement }
  get replayButton()  { return this.querySelector(".header-replay-button") as HTMLButtonElement }

  handleEvent(event: Event) {
    switch (event.type) {
    case "input":
      this.joinButton.disabled = this.nameInput.value.length === 0
      break
    case "submit":
      event.preventDefault()
      this.onJoin()
      break
    }
  }

  reset(player: Player) {
    hide(this.form)
    hide(this.opponent)
    show(this.details)
    this.playerName.innerText = player.name
    this.update(player)
  }

  start(player: Player, opponent: Player) {
    show(this.opponent)
    show(this.playerCross, player.piece === Piece.Cross)
    show(this.playerDot, player.piece === Piece.Dot)
    show(this.opponentCross, opponent.piece === Piece.Cross)
    show(this.opponentDot, opponent.piece === Piece.Dot)
    this.opponentName.innerText = opponent.name
    this.update(player)
  }

  update(player: Player) {
    this.status.innerText = this.statusLabel(player)
  }

  end(player: Player) {
    this.update(player)
  }

  private statusLabel(player: Player) {
    switch (player.state) {
    case PlayerState.Joining:     return "Joining game..."
    case PlayerState.WaitingGame: return "Waiting for an opponent"
    case PlayerState.TakingTurn:  return "It's your turn"
    case PlayerState.WaitingTurn: return "Waiting for your opponent's turn"
    case PlayerState.Won:         return "YOU WON!"
    case PlayerState.Lost:        return "Sorry, you lost"
    case PlayerState.Tied:        return "The game was tied"
    case PlayerState.Abandoned:   return "Your opponent left the game"
    }
    assert.unreachable(player.state)
  }

  onJoin() {
    this.nameInput.disabled = true
    this.joinButton.disabled = true
    this.dispatchEvent(new JoinEvent("join", {
      detail: {
        name: this.nameInput.value,
      },
    }))
  }

}
