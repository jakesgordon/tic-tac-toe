# Tic Tac Toe - Node

This repository includes an implementation of a simple Tic Tac Toe game with multiplayer support
provided by a Node.js websocket server. You can play the game at [https://ttt.jakesgordon.com](https://ttt.jakesgordon.com),
but of course you'll need to wait for a second player to join. You can always play against
yourself if you use 2 browsers or 2 separate devices.

> NOTE: I may - or may not - still be hosting this game by the time you read this, so YMMV.

![screenshot](./doc/mobile.png)

## Usage

```bash
> npm run dev        # run both client and server
> npm run dev:client # run client only
> npm run dev:server # run server only
> npm run test       # run (server) unit tests
> npm run lint       # run eslint
> npm run build      # build production assets
```

## Repository Structure

The project has the following dependencies:

  * [Vite](https://vitejs.dev/) for the development server
  * [Typescript](https://www.typescriptlang.org/) as the development language
  * [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) and [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - no fancy frameworks needed :-)

```console
    └── index.html          - page layout
    └── public              - static assets
    └── src
        └── interface.ts    - abstract types used by both client and server
        └── server.ts       - THE WEBSOCKET SERVER
        └── client.ts       - THE WEBSOCKET CLIENT
        └── client
            └── header.ts   - a webcomponent
            └── board.ts    - a webcomponent
```

## Overview

There are 3  main components

  * [client.ts](./src/client.ts) is the client side entry point that constructs a websocket
    and connects to the server. It has no real game logic and simply sends commands
    to the server in response to user actions and then updates the UX in response to
    events it receives back from the server.
  * [server.ts](./src/server.ts) is the websocket server that does all the heavy lifting and manages
    a [lobby](./src/server/lobby.ts#L17) of [players](./src/server/player.ts#L19) and the game [board](./src/server/board.ts#L9)
    that they are currently playing. It responds to the commands it receives from the websocket
    clients by updating game state and sending events back.
  * [interface.ts](./src/interface.ts) contains the enums, commands, and event types shared
    between the client and the server.

## Interface - Enums

The [client](./src/client.ts) and [server](./src/server.ts) share some simple enums and interfaces
that help define some of the key concepts in a Tic-Tac-Toe game, and can be found in the
[interface](./src/interface.ts) module:

```typescript
export enum Piece {
  Dot   = "dot",
  Cross = "cross",
}

export enum Position {
  TopLeft     = "top-left",
  Top         = "top",
  TopRight    = "top-right",
  Left        = "left",
  Center      = "center",
  Right       = "right",
  BottomLeft  = "bottom-left",
  Bottom      = "bottom",
  BottomRight = "bottom-right",
}

export enum WinningLine {
  TopRow       = "top-row",
  MiddleRow    = "middle-row",
  BottomRow    = "bottom-row",
  LeftColumn   = "left-column",
  CenterColumn = "center-column",
  RightColumn  = "right-column",
  DownDiagonal = "down-diagonal",
  UpDiagonal   = "up-diagonal",
}
```

In addition, the `PlayerState` enum acts as a state machine for the player who can be in any one
of the following states at any given time:

```typescript
export enum PlayerState {
  Joining     = "Joining",
  WaitingGame = "WaitingGame",
  TakingTurn  = "TakingTurn",
  WaitingTurn = "WaitingTurn",
  Won         = "Won",
  Lost        = "Lost",
  Tied        = "Tied",
  Abandoned   = "Abandoned",
}
```

The `Player` interface represents the minimalist representation of a player that is sent
between the client and server. They must have a state and a name, and they *might* have a
piece if they are currently playing a game.

```typescript
export interface Player {
  state: PlayerState;
  name: string;
  piece?: Piece;
}
```

## Interface - Commands

The [client](./src/client.ts) and [server](./src/server.ts) also share some important types that
enable our event driven architecture where a `Command` can be sent to the server and an `Event`
can be sent back to the client. We use a pattern called a [discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
to represent all of the possible commands and their arguments.

```typescript
export enum Command {
  Join   = "Join",
  Turn   = "Turn",
  Leave  = "Leave",
  Replay = "Replay",
}

interface JoinCommand {
  type: Command.Join;
  name: string;
}

interface TurnCommand {
  type: Command.Turn;
  position: Position;
}

interface LeaveCommand {
  type: Command.Leave;
}

interface ReplayCommand {
  type: Command.Replay;
}

export type AnyCommand =
  | JoinCommand
  | TurnCommand
  | LeaveCommand
  | ReplayCommand
```

This pattern enables our [server](./src/server.ts) to easily switch based on the command and
perform different actions, e.g:

```typescript
execute(command: AnyCommand) {
  switch(command.type) {
  case Command.Join:   return this.join(command.name)
  case Command.Turn:   return this.turn(command.position)
  case Command.Leave:  return this.leave()
  case Command.Replay: return this.replay()
  }
}
```

## Interface - Events

Similarly, we use the same [discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
pattern to represent all of the possible events and their arguments.

```typescript
export enum Event {
  PlayerReady       = "PlayerReady",
  GameStarted       = "GameStarted",
  PlayerTookTurn    = "PlayerTookTurn",
  OpponentTookTurn  = "OpponentTookTurn",
  OpponentAbandoned = "OpponentAbandoned",
  PlayerWon         = "PlayerWon",
  PlayerLost        = "PlayerLost",
  PlayerTied        = "PlayerTied",
  UnexpectedError   = "UnexpectedError",
}

export interface PlayerReadyEvent {
  type: Event.PlayerReady;
  player: Player;
}

export interface GameStartedEvent {
  type: Event.GameStarted;
  player: Player;
  opponent: Player;
}

export interface PlayerTookTurnEvent {
  type:     Event.PlayerTookTurn;
  player:   Player;
  opponent: Player;
  position: Position;
}

export interface OpponentTookTurnEvent {
  type:     Event.OpponentTookTurn;
  player:   Player;
  opponent: Player;
  position: Position;
}

export interface OpponentAbandonedEvent {
  type:     Event.OpponentAbandoned;
  player:   Player;
  opponent: Player;
}

export interface PlayerWonEvent {
  type: Event.PlayerWon;
  player: Player;
  opponent: Player;
  line: WinningLine;
}

export interface PlayerLostEvent {
  type: Event.PlayerLost;
  player: Player;
  opponent: Player;
  line: WinningLine;
}

export interface PlayerTiedEvent {
  type: Event.PlayerTied;
  player: Player;
  opponent: Player;
}

export interface UnexpectedErrorEvent {
  type: Event.UnexpectedError;
  error: UnexpectedError;
}

export type AnyEvent =
  | PlayerReadyEvent
  | GameStartedEvent
  | PlayerTookTurnEvent
  | OpponentTookTurnEvent
  | OpponentAbandonedEvent
  | PlayerWonEvent
  | PlayerLostEvent
  | PlayerTiedEvent
  | UnexpectedErrorEvent
```

Again, this pattern enables our [client](./src/client.ts) to easily switch based on the event
in order to handle it appropriately, e.g:

```typescript
handle(event: AnyEvent) {
  switch(event.type) {
  case Event.PlayerReady:       return this.onPlayerReady(event)
  case Event.GameStarted:       return this.onGameStarted(event)
  case Event.PlayerTookTurn:    return this.onPlayerTookTurn(event)
  case Event.OpponentTookTurn:  return this.onOpponentTookTurn(event)
  case Event.OpponentAbandoned: return this.onOpponentAbandoned(event)
  case Event.PlayerWon:         return this.onPlayerWon(event)
  case Event.PlayerLost:        return this.onPlayerLost(event)
  case Event.PlayerTied:        return this.onPlayerTied(event)
  case Event.UnexpectedError:   return this.onError(event.error)
  }
}
```

## The Client

The [client](./src/client.ts) is fairly simple and naive. It handles events from the user
by sending commands to the server, and then it [responds to events](./src/client.ts#L159)
sent back from the server by updating the UX for the user.

It is broken up into 2 web components, the [header](./src/client/header.ts) renders the current
game information to the user, while the [board](./src/client/board.ts) renders the tic-tac-toe
board itself. Both are fairly simple web components that use a `<template>` that can be found
in the main [index.html](./index.html) file, and CSS styling declared in
[client.css](./src/client.css). The UX is simple and there is no need for shadow DOM encapsulation
or any reactive frameworks. They simply update various fixed elements of the UX
using traditional DOM manipulation and the strategic use of css classNames to show or
hide elements.

## The Server

The [server](./src/server.ts) does the bulk of the work. It provides a web socket server that
adds a new player to the lobby when a new client connects and starts listening for commands
from that client. When a command is received it is passed to [lobby.execute](./src/server/lobby.ts#L24)
which updates the game state and sends events back to each player.

The **server** consists of 3 main modules:

  * [player](./src/server/player.ts#L19) - a small class to manage the player state
  * [board](./src/server/board.ts#L9) - a small class to manage the board state
  * [lobby](./src/server/lobby.ts#L17) - the main class that executes commands and updates the
    player and board state before sending events back to the client(s)

In addition, if the server detects a websocket close then it removes the player from the system.
