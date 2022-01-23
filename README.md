# Geo Comb

Simple repository for manipulating demographic data from [Data USA](https://datausa.io/).

## Example

### `index.ts`

```ts
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
```

### Output

```json
{
  "new-mexico": {
    "American Samoa": 383,
    "Albania": 137,
    "Austria": 102,
    "Belgium": 54,
    "Bulgaria": 385,
    "Denmark": 13,
    "France": 527,
    "Germany": 2954,
    "Greece": 701,
    "Hungary": 293,
    "Ireland": 195,
    "Italy": 657,
    "Netherlands": 40,
    "Norway": 146,
    "Poland": 302,
    "Romania": 845,
    "Spain": 98,
    "Sweden": 65,
    "Switzerland": 15,
    "United Kingdom, not specified": 986,
    "England": 1837,
    "Scotland": 495,
    "Northern Ireland": 423,
    "Bosnia and Herzegovina": 54,
    "Serbia": 78,
    "Latvia": 60,
    "Azerbaijan": 387,
    "Russia": 185,
    "Ukraine": 140,
    "USSR": 10,
    "Europe": 62,
    "Other Europe, not specified": 331,
    "Myanmar": 233,
    "Cambodia": 47,
    "China": 4044,
    "Hong Kong": 112,
    "India": 3160,
    "Indonesia": 452,
    "Iran": 2572,
    "Iraq": 795,
    "Japan": 1374,
    "Korea": 2143,
    "Laos": 138,
    "Lebanon": 295,
    "Malaysia": 220,
    "Nepal": 408,
    "Pakistan": 275,
    "Philippines": 6791,
    "Saudi Arabia": 82,
    "Singapore": 154,
    "Sri Lanka": 161,
    "Taiwan": 678,
    "Thailand": 681,
    "Vietnam": 6226,
    "Canada": 1545,
    "Mexico": 129061,
    "Costa Rica": 1064,
    "El Salvador": 2087,
    "Guatemala": 1942,
    "Honduras": 942,
    "Nicaragua": 205,
    "Panama": 362,
    "Cuba": 3118,
    "Dominica": 221,
    "Dominican Republic": 301,
    "Haiti": 488,
    "Jamaica": 20,
    "St Vincent & the Grenadines": 103,
    "Trinidad & Tobago": 58,
    "Argentina": 212,
    "Bolivia": 323,
    "Brazil": 254,
    "Chile": 302,
    "Colombia": 1945,
    "Ecuador": 366,
    "Peru": 1627,
    "Venezuela": 1067,
    "Americas, not specified": 453,
    "Cameroon": 95,
    "Congo": 166,
    "Egypt": 219,
    "Ethiopia": 119,
    "Eritrea": 138,
    "Ghana": 140,
    "Kenya": 513,
    "Libya": 51,
    "Morocco": 147,
    "Nigeria": 595,
    "South Africa": 346,
    "Tanzania": 50,
    "Democratic Republic of Congo (Zaire)": 1224,
    "Zambia": 137,
    "Africa": 229,
    "Australia": 590,
    "Micronesia": 31,
    "New Zealand": 266,
    "Other U.S. Island Areas, Oceania, Not Specified, or at Sea": 248
  }
}
```

## Prerequisits

1. Node ([NVM](https://github.com/nvm-sh/nvm) highly recommended)
2. Yarn

## Usage

1. `git clone ...`
2. `yarn && yarn start`
