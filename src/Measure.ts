import * as Fun from 'fp-ts/Functor'
import * as Ap from 'fp-ts/Apply'
import * as Apl from 'fp-ts/Applicative'
import * as Pt from 'fp-ts/Pointed'
import * as RA from 'fp-ts/ReadonlyArray'
import * as Mon from 'fp-ts/Monad'
import * as N from 'fp-ts/number'
import { flow, pipe } from 'fp-ts/function'

export interface Measure<A> {
  (now: (a: A) => number): number
}

export const URI = 'Measure'

export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Measure<A>
  }
}

// ########################
// ### Utilities ##########
// ########################

export const integrate: <A>(
  f: (a: A) => number,
) => (nu: Measure<A>) => number = f => nu => nu(f)

export const map: <A, B>(f: (a: A) => B) => (fa: Measure<A>) => Measure<B> =
  f => fa => g =>
    pipe(fa, integrate(flow(f, g)))

export const of: <A>(a: A) => Measure<A> = a => c => c(a)

export const ap: <A, B>(
  h: Measure<A>,
) => (g: Measure<(a: A) => B>) => Measure<B> = h => g => f =>
  g(k => h(flow(k, f)))

export const chain: <A, B>(
  f: (a: A) => Measure<B>,
) => (rho: Measure<A>) => Measure<B> = f => rho => g =>
  pipe(
    rho,
    integrate(m => pipe(f(m), integrate(g))),
  )

export const fromMassFunction: <A>(
  f: (a: A) => number,
) => (support: ReadonlyArray<A>) => Measure<A> = f => support => g =>
  pipe(
    support,
    RA.foldMap(N.MonoidSum)(x => f(x) * g(x)),
  )

// ########################
// ### Internal ###########
// ########################

const _map: Fun.Functor1<URI>['map'] = (fa, f) => pipe(fa, map(f))
const _ap: Apl.Applicative1<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))
const _chain: Mon.Monad1<URI>['chain'] = (fa, f) => pipe(fa, chain(f))

// ########################
// ### Instances ##########
// ########################

export const Functor: Fun.Functor1<URI> = {
  URI,
  map: _map,
}

export const Apply: Ap.Apply1<URI> = {
  ...Functor,
  ap: _ap,
}

export const Pointed: Pt.Pointed1<URI> = {
  URI,
  of,
}

export const Applicative: Apl.Applicative1<URI> = {
  ...Apply,
  ...Pointed,
}

export const Monad: Mon.Monad1<URI> = {
  ...Applicative,
  chain: _chain,
}
