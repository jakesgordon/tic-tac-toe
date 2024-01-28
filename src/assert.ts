import { Piece } from "./interface"

export const assert: {
  unreachable: (arg: never) => never;
  isPiece: (value: Piece | undefined) => asserts value is Piece;
} = {

  unreachable: (_arg: never): never => {
    throw new Error("unreachable")
  },

  isPiece: (value: Piece | undefined): asserts value is Piece => {
    if (value === undefined)
      throw new Error("value is undefined")
  }
}
