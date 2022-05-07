import * as Vec from './Vector'

export interface VectorField<A> {
  add: <Length extends number>(
    x: Vec.Vector<Length, A>,
    y: Vec.Vector<Length, A>,
  ) => Vec.Vector<Length, A>
  zero: <Length extends number>(length: Length) => Vec.Vector<Length, A>
  scalarMul: <Length extends number>(
    x: A,
    y: Vec.Vector<Length, A>,
  ) => Vec.Vector<Length, A>
  scalarOne: () => A
  sub: <Length extends number>(
    x: Vec.Vector<Length, A>,
    y: Vec.Vector<Length, A>,
  ) => Vec.Vector<Length, A>
}
