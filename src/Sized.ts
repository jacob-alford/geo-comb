import { tuple } from 'fp-ts/function'

export interface Sized1<Length extends number> {
  readonly shape: [Length]
}

export const mkWrap1: <Length extends number>(
  length: Length,
) => <A>(a: A) => Sized1<Length> & A = shape => a =>
  Object.assign({ shape: tuple(shape) }, a)

export interface Sized2<Rows extends number, Cols extends number> {
  readonly shape: [Rows, Cols]
}

export const mkWrap2: <Rows extends number, Cols extends number>(
  shape: [Rows, Cols],
) => <A>(a: A) => Sized2<Rows, Cols> & A = shape => a =>
  Object.assign({ shape }, a)
