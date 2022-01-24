import * as Console from 'fp-ts/Console'
import * as Eq from 'fp-ts/Eq'
import * as IO from 'fp-ts/IO'
import * as N from 'fp-ts/number'
import * as Ord from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RR from 'fp-ts/ReadonlyRecord'
import * as RT from 'fp-ts/ReaderTask'
import * as RM from 'fp-ts/ReadonlyMap'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as Sg from 'fp-ts/Semigroup'
import * as Str from 'fp-ts/string'
import { flow, identity, pipe } from 'fp-ts/function'

import * as REST from './REST'
import * as API from './API'
import * as FS from './FS'

interface RacePopulation {
  race: string
  population: number
  hispanic: boolean
}

const ordRacePopulation: Ord.Ord<RacePopulation> = Ord.reverse(
  pipe(
    N.Ord,
    Ord.contramap(({ population }) => population),
  ),
)

interface LanguagePopulation {
  language: string
  speakers: number
}

const ordLanguagePopulation: Ord.Ord<LanguagePopulation> = Ord.reverse(
  pipe(
    N.Ord,
    Ord.contramap(({ speakers }) => speakers),
  ),
)

const main: IO.IO<void> = () =>
  pipe(
    API.getLanguagesByPlace(),
    RTE.map(
      flow(
        ({ data }) => data,
        RA.foldMap(
          RM.getUnionMonoid(
            Eq.tuple(Str.Eq, Str.Eq),
            RA.getSemigroup<LanguagePopulation>(),
          ),
        )(
          ({
            'Language Spoken at Home': language,
            'Slug Place': place,
            'Languages Spoken': languageSpeakers,
            'ID Place': placeId,
          }) =>
            RM.singleton(
              [place, placeId],
              RA.of({ language, speakers: languageSpeakers }),
            ),
        ),
      ),
    ),
    RTE.chain(
      flow(
        RM.mapWithIndex(([place, placeId], languages) =>
          pipe(
            API.getDemographicsByPlaceId(placeId),
            RTE.map(
              flow(
                ({ data }) => data,
                RA.foldMap(
                  RR.getUnionMonoid(
                    Sg.struct({
                      races: RA.getSemigroup<RacePopulation>(),
                      languages: Sg.first<ReadonlyArray<LanguagePopulation>>(),
                    }),
                  ),
                )(
                  ({
                    Race: race,
                    'Hispanic Population': population,
                    Ethnicity: ethnicity,
                  }) =>
                    RR.singleton(place, {
                      races: RA.of({
                        race,
                        population,
                        hispanic: ethnicity === 'Hispanic or Latino',
                      }),
                      languages,
                    }),
                ),
              ),
            ),
          ),
        ),
        m =>
          RM.getTraversable(Ord.tuple(Str.Ord, Str.Ord)).traverse(
            RTE.ApplicativePar,
          )(m, identity),
        RTE.map(
          RM.foldMap(Ord.tuple(Str.Ord, Str.Ord))(
            RR.getUnionMonoid(
              Sg.struct({
                languages: Sg.first<ReadonlyArray<LanguagePopulation>>(),
                races: RA.getSemigroup<RacePopulation>(),
              }),
            ),
          )(
            RR.map(({ races, languages }) => ({
              languages: pipe(languages, RA.sort(ordLanguagePopulation)),
              races: pipe(races, RA.sort(ordRacePopulation)),
            })),
          ),
        ),
      ),
    ),
    RTE.fold(
      e => RT.fromIO(Console.error(e)),
      data =>
        pipe(
          FS.writeFile(
            '../language-and-race-by-place.json',
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
