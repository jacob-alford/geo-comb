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

import { StatesAndSizeInSqMilesByTitle } from './stateSize'

interface PlaceAreaHomelessness {
  state: string
  area: number
  population: number
  chronicallyHomeless: number
  chronicallyHomelessAreaRatio: number
  chronicallyHomelessPopulationRatio: number
}

const placeAreaHomelessnessFromApi: (
  place: API.ChronicallyHomelessStateData & { area: number },
) => PlaceAreaHomelessness = ({
  Population,
  'Estimates of Chronically Homeless Individuals': chronicallyHomeless,
  area,
  'Slug State': state,
}) => ({
  state,
  area,
  population: Population,
  chronicallyHomeless: chronicallyHomeless!,
  chronicallyHomelessAreaRatio: chronicallyHomeless! / area,
  chronicallyHomelessPopulationRatio: chronicallyHomeless! / Population,
})

const ordPlaceAreaHomelessness: Ord.Ord<PlaceAreaHomelessness> = pipe(
  N.Ord,
  Ord.contramap(({ chronicallyHomeless }) => chronicallyHomeless),
)

const main: IO.IO<void> = () =>
  pipe(
    API.getChronicallyHomelessByState(),
    RTE.chainW(
      flow(
        ({ data }) =>
          pipe(
            data,
            RA.filter(
              ({ 'Estimates of Chronically Homeless Individuals': homeless }) =>
                homeless !== undefined,
            ),
            E.traverseArray(state =>
              pipe(
                StatesAndSizeInSqMilesByTitle,
                RA.findFirst(([stateTitle]) => stateTitle === state.State),
                O.map(([, stateArea]) =>
                  Object.assign({}, state, { area: stateArea }),
                ),
                O.map(placeAreaHomelessnessFromApi),
                E.fromOption(() =>
                  REST.procError(
                    `No state found for state-id: ${state['ID State']}`,
                  ),
                ),
              ),
            ),
          ),
        E.map(RA.sort(ordPlaceAreaHomelessness)),
        RTE.fromEither,
      ),
    ),
    RTE.map(states =>
      RR.fromFoldableMap(Sg.first<PlaceAreaHomelessness>(), RA.Foldable)(
        states,
        state => [state.state, state],
      ),
    ),
    RTE.fold(
      e => RT.fromIO(Console.error(REST.Show.show(e))),
      data =>
        pipe(
          FS.writeFile(
            '../homelessnessByState.json',
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
