# Geo Comb

Simple repository for manipulating demographic data from [Data USA](https://datausa.io/).

## Example 1: Foreign Country of Origin in New Mexico

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

## Prerequisites

1. Node ([NVM](https://github.com/nvm-sh/nvm) highly recommended)
2. Yarn

## Usage

1. `git clone https://github.com/jacob-alford/geo-comb.git`
2. `yarn && yarn start`

## Example 2: Chinese speakers by MSA (Metropolitan Statistical Area)

### Program

```ts
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
    API.getLanguagesByMSA(),
    RTE.map(
      flow(
        ({ data }) => data,
        RA.filterMap(
          ({
            'Language Spoken at Home': language,
            'Slug MSA': msa,
            'Languages Spoken': speakers,
          }) =>
            pipe(
              tuple(msa, speakers),
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
```

### Output

```json
[
  ["louisvillejefferson-county-ky-in", 2126],
  ["jacksonville-fl-31000US27260", 4660],
  ["rochester-ny-31000US40380", 4674],
  ["buffalo-cheektowaga-niagara-falls-ny", 5614],
  ["worcester-ma-ct", 5704],
  ["milwaukee-waukesha-west-allis-wi", 6004],
  ["nashville-davidson-murfreesboro-franklin-tn", 6017],
  ["richmond-va-31000US40060", 6080],
  ["providence-warwick-ri-ma", 6271],
  ["virginia-beach-norfolk-newport-news-va-nc", 6728],
  ["oxnard-thousand-oaks-ventura-ca", 7711],
  ["san-antonio-new-braunfels-tx", 7884],
  ["new-haven-milford-ct", 8273],
  ["albany-schenectady-troy-ny", 8289],
  ["cleveland-elyria-oh", 8555],
  ["charlotte-concord-gastonia-nc-sc", 8717],
  ["salt-lake-city-ut-31000US41620", 9037],
  ["bridgeport-stamford-norwalk-ct", 9170],
  ["kansas-city-mo-ks", 9291],
  ["indianapolis-carmel-anderson-in", 9632],
  ["pittsburgh-pa-31000US38300", 10235],
  ["hartford-west-hartford-east-hartford-ct", 11041],
  ["cincinnati-oh-ky-in", 11572],
  ["raleigh-nc-31000US39580", 11869],
  ["denver-aurora-lakewood-co", 13253],
  ["tampa-st-petersburg-clearwater-fl", 13809],
  ["orlando-kissimmee-sanford-fl", 14074],
  ["columbus-oh-31000US18140", 17234],
  ["st-louis-mo-il", 17291],
  ["minneapolis-st-paul-bloomington-mn-wi", 18202],
  ["austin-round-rock-tx", 18567],
  ["detroit-warren-dearborn-mi", 20966],
  ["baltimore-columbia-towson-md", 23226],
  ["miami-fort-lauderdale-west-palm-beach-fl", 23735],
  ["phoenix-mesa-scottsdale-az", 26039],
  ["portland-vancouver-hillsboro-or-wa", 29777],
  ["las-vegas-henderson-paradise-nv", 31133],
  ["atlanta-sandy-springs-roswell-ga", 42048],
  ["san-diego-carlsbad-ca", 51997],
  ["riverside-san-bernardino-ontario-ca", 54073],
  ["sacramento-roseville-arden-arcade-ca", 54386],
  ["dallas-fort-worth-arlington-tx", 61390],
  ["philadelphia-camden-wilmington-pa-nj-de-md", 76740],
  ["houston-the-woodlands-sugar-land-tx", 81287],
  ["washington-arlington-alexandria-dc-va-md-wv", 97759],
  ["chicago-naperville-elgin-il-in-wi", 98847],
  ["seattle-tacoma-bellevue-wa", 116109],
  ["boston-cambridge-newton-ma-nh", 138342],
  ["san-jose-sunnyvale-santa-clara-ca", 176606],
  ["san-francisco-oakland-hayward-ca", 392697],
  ["los-angeles-long-beach-anaheim-ca", 487715],
  ["new-york-newark-jersey-city-ny-nj-pa", 654256]
]
```
