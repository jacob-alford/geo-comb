import * as Fld from 'fp-ts/Field'
import * as Ord from 'fp-ts/Ord'
import * as O from 'fp-ts/Option'

export interface Sample<A> extends ReadonlyArray<A> {}

export interface Histogram<A> extends ReadonlyMap<A, number> {}

export interface Statistic<A> extends Fld.Field<A> {
  mean: (sample: Sample<A>) => A
  variance: (sample: Sample<A>) => A
  stddev: (sample: Sample<A>) => A
  median: (sample: Sample<A>) => A
}

export interface OrderedStatistic<A> extends Statistic<A>, Ord.Ord<A> {
  mode: (sample: Sample<A>) => O.Option<A>
  histogram: (sample: Sample<A>) => Histogram<A>
  max: (sample: Sample<A>) => O.Option<A>
  min: (sample: Sample<A>) => O.Option<A>
}
