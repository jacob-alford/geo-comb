import * as IO from 'fp-ts/IO'
import * as Console from 'fp-ts/Console'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import * as Ord from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RR from 'fp-ts/ReadonlyRecord'
import * as RT from 'fp-ts/ReaderTask'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { flow, pipe, tuple } from 'fp-ts/function'

import * as REST from './REST'
import * as API from './API'

const main: IO.IO<void> = () =>
  pipe(
    API.getLanguagesByPlace(),
    RTE.map(
      flow(
        ({ data }) => data,
        RA.filterMap(
          ({
            'Language Spoken at Home': language,
            'Slug Place': place,
            'Languages Spoken': speakers,
          }) =>
            pipe(
              tuple(place, speakers),
              O.fromPredicate(
                () => language === 'Chinese (Incl. Mandarin, Cantonese)',
              ),
            ),
        ),
        RA.sort(Ord.tuple(Ord.trivial, N.Ord)),
      ),
    ),
    RTE.fold(
      e => RT.fromIO(Console.error(e)),
      data => RT.fromIO(Console.log(data)),
    ),
    rt => rt(REST.env)(),
  )

main()
