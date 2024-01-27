import { assert } from "../assert"
import { Player, PlayerState } from "../interface"
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

  get nameInput()  { return this.querySelector(".header-name-input") as HTMLInputElement }
  get joinButton() { return this.querySelector(".header-join-button") as HTMLButtonElement }
  get status()     { return this.querySelector(".header-status") as HTMLElement  }
  get playerName() { return this.querySelector(".header-player-name") as HTMLElement }

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
    show(this.details)
    this.playerName.innerText = player.name
    this.update(player)
  }

  update(player: Player) {
    this.status.innerText = this.statusLabel(player)
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
