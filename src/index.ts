import * as IO from 'fp-ts/IO'
import * as Console from 'fp-ts/Console'
import * as N from 'fp-ts/number'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RR from 'fp-ts/ReadonlyRecord'
import * as RT from 'fp-ts/ReaderTask'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { flow, pipe } from 'fp-ts/function'

import * as REST from './REST'
import * as API from './API'

const main: IO.IO<void> = () =>
  pipe(
    API.getTotalForeignPopulationByStateAndBirthplace(),
    RTE.map(
      flow(
        ({ data }) => data,
        RA.filter(({ 'Slug State': state }) => state === 'new-mexico'),
        RA.foldMap(RR.getUnionMonoid(RR.getUnionMonoid(N.MonoidSum)))(
          ({
            'Slug State': state,
            'Total Population': population,
            Birthplace: birthplace,
          }) => RR.singleton(state, RR.singleton(birthplace, population)),
        ),
      ),
    ),
    RTE.fold(
      e => RT.fromIO(Console.error(e)),
      data => RT.fromIO(Console.log(data)),
    ),
    rt => rt(REST.env)(),
  )

main()
