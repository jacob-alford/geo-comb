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

interface AsianChineseSpeakers {
  place: string
  chineseSpeakers: number
  asianPopulation: number
  chineseSpeakersToAsianPopulationRatio: number
  populationInStateFromChina: number
}

const ordAsianChineseSpeakers: Ord.Ord<AsianChineseSpeakers> = Ord.reverse(
  pipe(
    N.Ord,
    Ord.contramap(
      ({ chineseSpeakersToAsianPopulationRatio }) =>
        chineseSpeakersToAsianPopulationRatio,
    ),
  ),
)

const main: IO.IO<void> = () =>
  pipe(
    API.getLanguagesByPlace(),
    RTE.map(
      flow(
        ({ data }) => data,
        RA.filter(
          ({ 'Language Spoken at Home': language }) =>
            language === 'Chinese (Incl. Mandarin, Cantonese)',
        ),
      ),
    ),
    RTE.chain(
      flow(
        RA.map(
          ({
            'ID Place': placeId,
            'Languages Spoken': chineseSpeakers,
            'Slug Place': place,
          }) =>
            pipe(
              API.getDemographicsByPlaceId(placeId),
              RTE.bindTo('demographics'),
              RTE.apS(
                'foreignBirthplaces',
                API.getForeignPopulationByGeographyIdResponse(placeId),
              ),
              RTE.chainEitherK(({ demographics, foreignBirthplaces }) =>
                pipe(
                  demographics.data,
                  RA.filter(
                    ({ Race, Ethnicity }) =>
                      Ethnicity !== 'Hispanic or Latino' &&
                      Race === 'Asian Alone',
                  ),
                  RNEA.fromReadonlyArray,
                  O.map(RNEA.head),
                  O.map(geographyDemographic => ({
                    ...geographyDemographic,
                    chineseSpeakers,
                    populationInStateFromChina: pipe(
                      foreignBirthplaces.data,
                      RA.findFirst(({ Birthplace }) => Birthplace === 'China'),
                      O.fold(
                        () => 0,
                        ({ 'Total Population': population }) => population,
                      ),
                    ),
                  })),
                  E.fromOption(() =>
                    REST.decodeError(`No asian population for place: ${place}`),
                  ),
                ),
              ),
            ),
        ),
        RTE.sequenceArray,
        RTE.map(
          flow(
            RA.map(
              ({
                chineseSpeakers,
                'Hispanic Population': asianPopulation,
                'Slug Geography': place,
                populationInStateFromChina,
              }): AsianChineseSpeakers => ({
                chineseSpeakers,
                asianPopulation,
                place,
                chineseSpeakersToAsianPopulationRatio:
                  chineseSpeakers / asianPopulation,
                populationInStateFromChina,
              }),
            ),
            RA.sort(ordAsianChineseSpeakers),
          ),
        ),
      ),
    ),
    RTE.fold(
      e => RT.fromIO(Console.error(e)),
      data => RT.fromIO(Console.log(data)),
      // pipe(
      //   FS.writeFile(
      //     '../language-and-race-by-place.json',
      //     JSON.stringify(data, null, 2),
      //   ),
      //   RTE.fromTaskEither,
      //   RTE.fold(
      //     err => RT.fromIO(Console.error(err)),
      //     () => RT.fromIO(Console.log('Success!')),
      //   ),
      // ),
    ),
    rt => rt(REST.env)(),
  )

main()
