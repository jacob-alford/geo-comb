import * as Console from 'fp-ts/Console'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import * as N from 'fp-ts/number'
import * as Ord from 'fp-ts/Ord'
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RR from 'fp-ts/ReadonlyRecord'
import * as RT from 'fp-ts/ReaderTask'
import * as RM from 'fp-ts/ReadonlyMap'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import * as Sg from 'fp-ts/Semigroup'
import * as Str from 'fp-ts/string'
import { flow, identity, pipe } from 'fp-ts/function'

import * as REST from './REST'
import * as API from './API'
import * as FS from './FS'

interface PropertyPlace {
  place: string
  medianPropertyValue: number
  population: number
  populationToPropertyValueRatio: number
}

const propertyPlaceFromApi: (
  place: API.PlaceValuePopulation,
) => PropertyPlace = ({
  Place: place,
  'Property Value': medianPropertyValue,
  Population: population,
}) => ({
  place,
  medianPropertyValue,
  population,
  populationToPropertyValueRatio: population / medianPropertyValue,
})

const ordPropertyPlace: Ord.Ord<PropertyPlace> = Ord.reverse(
  pipe(
    N.Ord,
    Ord.contramap(
      ({ populationToPropertyValueRatio }) => populationToPropertyValueRatio,
    ),
  ),
)

const main: IO.IO<void> = () =>
  pipe(
    API.getPropertyValueByPlace(),
    RTE.map(
      flow(
        ({ data }) => data,
        RA.filterMap(place =>
          pipe(
            propertyPlaceFromApi(place),
            O.fromPredicate(({ population }) => population > 100_000),
          ),
        ),
        RA.sort(ordPropertyPlace),
      ),
    ),
    RTE.fold(
      e => RT.fromIO(Console.error(REST.Show.show(e))),
      data =>
        pipe(
          FS.writeFile(
            '../property-values-for-cities.json',
            JSON.stringify(data, null, 2),
          ),
          RTE.fromTaskEither,
          RTE.fold(
            err => RT.fromIO(Console.error(err)),
            () => RT.fromIO(Console.log('Success!')),
          ),
        ),
    ),
    rt => rt(REST.env)(),
  )

main()
