export const assert = {
  unreachable: (_arg: never): never => {
    throw new Error("unreachable")
  },
}
