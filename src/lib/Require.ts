import { identity } from 'fp-ts/function'

interface Requirement<Reqs extends ReadonlyArray<unknown>> {
  readonly _reqs: Reqs
}

export type Require<F extends ReadonlyArray<unknown>, A extends object> = A &
  Requirement<F>

export const mkWrap: <Reqs extends ReadonlyArray<unknown>>() => <
  A extends object,
>(
  a: A,
) => Require<Reqs, A> = () => identity as any

export const mkUnwrap: <Reqs extends ReadonlyArray<unknown>>() => <
  A extends object,
>(
  a: Require<Reqs, A>,
) => A = () => identity as any
