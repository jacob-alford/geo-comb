import * as Eq_ from 'fp-ts/Eq'
import * as Mg from 'fp-ts/Magma'
import * as Mn from 'fp-ts/Monoid'
import * as Sg from 'fp-ts/Semigroup'
import * as Fld from 'fp-ts/Field'
import * as Rng from 'fp-ts/Ring'
import * as Show from 'fp-ts/Show'
import * as N from 'fp-ts/number'
import { pipe } from 'fp-ts/function'

import * as VecFld from './VectorField'
import * as Vec from './Vector'

export interface Complex {
  readonly r: number
  readonly i: number
}

export const Eq: Eq_.Eq<Complex> = Eq_.struct({
  r: N.Eq,
  i: N.Eq,
})

export const MagmaSub: Mg.Magma<Complex> = {
  concat: (x, y) => ({ r: x.r - y.r, i: x.i - y.i }),
}

export const SemigroupSum: Sg.Semigroup<Complex> = {
  concat: (x, y) => ({ r: x.r + y.r, i: x.i + y.i }),
}

export const SemigroupProduct: Sg.Semigroup<Complex> = {
  concat: (x, y) => ({ r: x.r * y.r - x.i * y.i, i: x.i * y.r + y.i * x.r }),
}

export const MonoidSum: Mn.Monoid<Complex> = {
  ...SemigroupSum,
  empty: {
    r: 0,
    i: 0,
  },
}

export const MonoidProduct: Mn.Monoid<Complex> = {
  ...SemigroupProduct,
  empty: {
    r: 1,
    i: 0,
  },
}

export const Field: Fld.Field<Complex> = {
  add: MonoidSum.concat,
  zero: MonoidSum.empty,
  mul: MonoidProduct.concat,
  one: MonoidProduct.empty,
  sub: MagmaSub.concat,
  div: ({ r: a, i: b }, { r: c, i: d }) => ({
    r: (a * c + b * d) / (c ** 2 + d ** 2),
    i: (b * c - a * d) / (c ** 2 + d ** 2),
  }),
  mod: () => MonoidSum.empty,
  degree: () => 1,
}

export interface ComplexVector<Length extends number>
  extends Vec.Vector<Length, Complex> {}

export const VectorField: VecFld.VectorField<Complex> =
  Vec.getVectorField(Field)
