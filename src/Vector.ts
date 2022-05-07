import { pipe, tuple, flow } from 'fp-ts/function'
import * as Fld from 'fp-ts/Field'
import * as N from 'fp-ts/number'
import * as RA from 'fp-ts/ReadonlyArray'
import * as O from 'fp-ts/Option'
import * as Nt from './lib/Newtype'
import * as Sz from './Sized'
import * as VecFld from './VectorField'

const VectorBrand = Symbol('Vector')
type VectorBrand = Nt.Brand<typeof VectorBrand>

export interface Vector<Length extends number, A>
  extends Sz.Sized1<Length>,
    Nt.Newtype<ReadonlyArray<A>, VectorBrand> {}

const wrap = <Length extends number, A>(
  as: ReadonlyArray<A>,
): Vector<Length, A> =>
  pipe(as, Nt.mkWrap<VectorBrand>(), Sz.mkWrap1<Length>(as.length as Length))

const unwrap = Nt.mkUnwrap<VectorBrand>()

export const fromArray: <Length extends number, A>(
  data: ReadonlyArray<A>,
) => Vector<Length, A> = wrap

export const toArray: <Length extends number, A>(
  vec: Vector<Length, A>,
) => ReadonlyArray<A> = unwrap

export const map: <A, B>(
  f: (a: A) => B,
) => <Length extends number>(fa: Vector<Length, A>) => Vector<Length, B> = f =>
  flow(unwrap, RA.map(f), a => wrap(a))

export const zipWith: <Length extends number, A, B, C>(
  a: Vector<Length, A>,
  b: Vector<Length, B>,
  f: (as: A, bs: B) => C,
) => Vector<Length, C> = (as, bs, f) => {
  const out = []
  for (const a of as) {
    for (const b of bs) {
      out.push(f(a, b))
    }
  }
  return wrap(out)
}

export const fromLength: <Length extends number>(
  length: Length,
) => <A>(a: A) => Vector<Length, A> = length => a =>
  pipe(
    Array.from({ length }, () => a),
    as => wrap(as),
  )

export const mergeLengths = <L1 extends number, L2 extends number, A, B>([
  v1,
  v2,
]: [Vector<L1, A>, Vector<L2, B>]): O.Option<[Vector<L1, A>, Vector<L1, B>]> =>
  pipe(
    tuple(v1 as unknown as Vector<L1, A>, v2 as unknown as Vector<L1, B>),
    O.fromPredicate(([v1, v2]) => v1.shape[0] === v2.shape[0]),
  )

export const getVectorField = <A>({
  add,
  sub,
  mul,
  one,
  zero,
}: Fld.Field<A>): VecFld.VectorField<A> => ({
  add: (x, y) => zipWith(x, y, add),
  sub: (x, y) => zipWith(x, y, sub),
  scalarMul: (a, x) =>
    pipe(
      x,
      map(xi => mul(xi, a)),
    ),
  zero: length => pipe(zero, fromLength(length)),
  scalarOne: () => one,
})
