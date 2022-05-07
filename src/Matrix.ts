import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import { flow, pipe } from 'fp-ts/function'

import * as Nt from './lib/Newtype'
import * as Vec from './Vector'
import * as Sz from './Sized'

const MatrixBrand = Symbol('Matrix')
type MatrixBrand = Nt.Brand<typeof MatrixBrand>

export interface Matrix<Rows extends number, Cols extends number, A>
  extends Sz.Sized2<Rows, Cols>,
    Nt.Newtype<ReadonlyArray<Vec.Vector<Cols, A>>, MatrixBrand> {}

const wrap =
  <Rows extends number, Cols extends number, A>(shape: [Rows, Cols]) =>
  (as: ReadonlyArray<Vec.Vector<Cols, A>>): Matrix<Rows, Cols, A> =>
    pipe(as, Nt.mkWrap<MatrixBrand>(), Sz.mkWrap2(shape))

export const from2dArray =
  <Rows extends number, Cols extends number, A>([rows, cols]: [Rows, Cols]) =>
  (arr: ReadonlyArray<ReadonlyArray<A>>): O.Option<Matrix<Rows, Cols, A>> =>
    pipe(
      arr,
      O.fromPredicate(arr => arr.length === rows),
      O.filter(RA.every(row => row.length === cols)),
      O.map(
        flow(
          RA.map(a => Vec.fromArray<Cols, A>(a)),
          wrap([rows, cols]),
        ),
      ),
    )
