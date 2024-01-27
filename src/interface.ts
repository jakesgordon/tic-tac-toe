//=================================================================================================
// ENUMS
//=================================================================================================

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

export enum PlayerState {
  Joining     = "Joining",
  WaitingGame = "WaitingGame",
  TakingTurn  = "TakingTurn",
  WaitingTurn = "WaitingTurn",
}

//=================================================================================================
// INTERFACES
//=================================================================================================

export interface Player {
  state: PlayerState;
  name: string;
}

//=================================================================================================
// COMMANDS
//=================================================================================================

export enum Command {
  Ping = "Ping",
  Join = "Join",
}

interface PingCommand {
  type: Command.Ping;
}

interface JoinCommand {
  type: Command.Join;
  name: string;
}

export type AnyCommand =
  | PingCommand
  | JoinCommand

//=================================================================================================
// EVENTS
//=================================================================================================

export enum Event {
  Pong        = "Pong",
  PlayerReady = "PlayerReady",
  GameStarted = "GameStarted",
}

export interface PongEvent {
  type: Event.Pong;
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

export type AnyEvent =
  | PongEvent
  | PlayerReadyEvent
  | GameStartedEvent

//-------------------------------------------------------------------------------------------------
