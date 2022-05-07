import { identity } from 'fp-ts/function'

export interface Brand<S extends Symbol> {
  readonly brand: S
}

export type Newtype<A, Brand_ extends Brand<any>> = A & Brand_

export const mkWrap: <Brand_ extends Brand<any>>() => <
  A,
  Branded extends Newtype<A, Brand_>,
>(
  a: A,
) => Branded = () => identity as any

export const mkUnwrap: <Brand_ extends Brand<any>>() => <
  A,
  Branded extends Newtype<A, Brand_>,
>(
  branded: Branded,
) => A = () => identity as any
