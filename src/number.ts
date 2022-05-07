import * as N from 'fp-ts/number'

import * as Vec from './Vector'
import * as VecFld from './VectorField'

export interface RealVector<Length extends number>
  extends Vec.Vector<Length, number> {}

export const VectorField: VecFld.VectorField<number> = Vec.getVectorField(
  N.Field,
)
