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
  Won         = "Won",
  Lost        = "Lost",
  Tied        = "Tied",
  Abandoned   = "Abandoned",
}

export enum UnexpectedError {
  AlreadyJoined = "The player has already joined the lobby",
  PositionTaken = "The position was already taken",
  OutOfTurn     = "The player played out of turn",
  NotInGame     = "The player is not in a game yet",
}

//=================================================================================================
// INTERFACES
//=================================================================================================

export interface Player {
  state: PlayerState;
  name: string;
  piece?: Piece;
}

//=================================================================================================
// COMMANDS
//=================================================================================================

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

//=================================================================================================
// EVENTS
//=================================================================================================

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

//-------------------------------------------------------------------------------------------------
