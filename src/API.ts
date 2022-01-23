import * as E from 'fp-ts/Either'
import * as N from 'fp-ts/number'
import * as Ord from 'fp-ts/Ord'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as t from 'io-ts'
import { flow, pipe } from 'fp-ts/function'

import * as REST from './REST'

interface Env extends REST.FetchMethods {}

const DATA_USA_BASE_URL = 'https://api.datausa.io/api/data'

const extendBaseUrl: (url?: string) => string = (url = '') =>
  `${DATA_USA_BASE_URL}${url}`

/**
 *  Sample parameters
 */
/*
interface DataUSAParams_ {
  Geography: '16000US0807850' | '16000US2507000'
  Nativity: 1 | 2
  measure:
    | 'Total Population,Total Population MOE Appx'
    | 'Hispanic Population,Hispanic Population Moe'
  drilldowns: 'Birthplace' | 'Language Spoken at Home' | 'Race,Ethnicity'
  properties: 'Country Code'
}
*/

///////////////////////////////////////////
//  Total Population by State / Birthplace
///////////////////////////////////////////
export interface TotalForeignPopulationByStateAndBirthplaceParam {
  Nativity: 2
  measure: 'Total Population'
  drilldowns: 'State,Birthplace'
  properties: 'Country Code'
  year: 'latest'
}

const totalForeignPopulationByStateAndBirthplaceParams: TotalForeignPopulationByStateAndBirthplaceParam =
  {
    Nativity: 2,
    measure: 'Total Population',
    drilldowns: 'State,Birthplace',
    properties: 'Country Code',
    year: 'latest',
  }

interface StateBirthplacePopulation {
  'ID State': string
  State: string
  'ID Birthplace': number
  Birthplace: string
  'ID Year': number
  Year: string
  'ID Nativity': number
  Nativity: string
  'Country Code': string | null
  'Total Population': number
  'Slug State': string
}

interface TotalForeignPopulationByStateAndBirthplace {
  data: ReadonlyArray<StateBirthplacePopulation>
}

const totalForeignPopulationByStateAndBirthplace = t.type({
  data: t.array(
    t.type({
      'ID State': t.string,
      State: t.string,
      'ID Birthplace': t.number,
      Birthplace: t.string,
      'ID Year': t.number,
      Year: t.string,
      'ID Nativity': t.number,
      Nativity: t.string,
      'Country Code': t.union([t.null, t.string]),
      'Total Population': t.number,
      'Slug State': t.string,
    }),
  ),
})

export const ordStateBirthplacePopulation: Ord.Ord<StateBirthplacePopulation> =
  pipe(
    N.Ord,
    Ord.contramap(({ 'Total Population': totalPopulation }) => totalPopulation),
  )

export const getTotalForeignPopulationByStateAndBirthplace: () => RTE.ReaderTaskEither<
  Env,
  REST.RestError,
  TotalForeignPopulationByStateAndBirthplace
> =
  () =>
  ({ get }) =>
    pipe(
      get(extendBaseUrl(), totalForeignPopulationByStateAndBirthplaceParams),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(
          totalForeignPopulationByStateAndBirthplace.decode,
          E.mapLeft(flow(REST.decodeError)),
        ),
      ),
    )

///////////////////////////////////////////
//  Language by State
///////////////////////////////////////////
export interface LanguagesByStateParams {
  year: 'latest'
  measure: 'Languages Spoken'
  drilldowns: 'State,Language Spoken at Home'
}

const languagesByStateParams: LanguagesByStateParams = {
  year: 'latest',
  measure: 'Languages Spoken',
  drilldowns: 'State,Language Spoken at Home',
}

interface StateLanguagePopulation {
  'ID State': string
  State: string
  'ID Language Spoken at Home': number
  'Language Spoken at Home': string
  'ID Year': number
  Year: string
  'Languages Spoken': number
  'Slug State': string
}

interface LanguagesByState {
  data: ReadonlyArray<StateLanguagePopulation>
}

const languagesByState = t.type({
  data: t.array(
    t.type({
      'ID State': t.string,
      State: t.string,
      'ID Language Spoken at Home': t.number,
      'Language Spoken at Home': t.string,
      'ID Year': t.number,
      Year: t.string,
      'Languages Spoken': t.number,
      'Slug State': t.string,
    }),
  ),
})

export const getLanguagesByState: () => RTE.ReaderTaskEither<
  Env,
  REST.RestError,
  LanguagesByState
> =
  () =>
  ({ get }) =>
    pipe(
      get(extendBaseUrl(), languagesByStateParams),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(languagesByState.decode, E.mapLeft(flow(REST.decodeError))),
      ),
    )

///////////////////////////////////////////
//  Language by MSA
///////////////////////////////////////////
export interface LanguagesByMSAParams {
  year: 'latest'
  measure: 'Languages Spoken'
  drilldowns: 'MSA,Language Spoken at Home'
}

const languagesByMSAParams: LanguagesByMSAParams = {
  year: 'latest',
  measure: 'Languages Spoken',
  drilldowns: 'MSA,Language Spoken at Home',
}

interface MSALanguagePopulation {
  'ID MSA': string
  MSA: string
  'ID Language Spoken at Home': number
  'Language Spoken at Home': string
  'ID Year': number
  Year: string
  'Languages Spoken': number
  'Slug MSA': string
}

interface LanguagesByMSA {
  data: ReadonlyArray<MSALanguagePopulation>
}

const languagesByMSA = t.type({
  data: t.array(
    t.type({
      'ID MSA': t.string,
      MSA: t.string,
      'ID Language Spoken at Home': t.number,
      'Language Spoken at Home': t.string,
      'ID Year': t.number,
      Year: t.string,
      'Languages Spoken': t.number,
      'Slug MSA': t.string,
    }),
  ),
})

export const getLanguagesByMSA: () => RTE.ReaderTaskEither<
  Env,
  REST.RestError,
  LanguagesByMSA
> =
  () =>
  ({ get }) =>
    pipe(
      get(extendBaseUrl(), languagesByMSAParams),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(languagesByMSA.decode, E.mapLeft(flow(REST.decodeError))),
      ),
    )

///////////////////////////////////////////
//  Language by Place
///////////////////////////////////////////
export interface LanguagesByPlaceParams {
  year: 'latest'
  measure: 'Languages Spoken'
  drilldowns: 'Place,Language Spoken at Home'
}

const languagesByPlaceParams: LanguagesByPlaceParams = {
  year: 'latest',
  measure: 'Languages Spoken',
  drilldowns: 'Place,Language Spoken at Home',
}

interface PlaceLanguagePopulation {
  'ID Place': string
  Place: string
  'ID Language Spoken at Home': number
  'Language Spoken at Home': string
  'ID Year': number
  Year: string
  'Languages Spoken': number
  'Slug Place': string
}

interface LanguagesByPlace {
  data: ReadonlyArray<PlaceLanguagePopulation>
}

const languagesByPlace = t.type({
  data: t.array(
    t.type({
      'ID Place': t.string,
      Place: t.string,
      'ID Language Spoken at Home': t.number,
      'Language Spoken at Home': t.string,
      'ID Year': t.number,
      Year: t.string,
      'Languages Spoken': t.number,
      'Slug Place': t.string,
    }),
  ),
})

export const getLanguagesByPlace: () => RTE.ReaderTaskEither<
  Env,
  REST.RestError,
  LanguagesByPlace
> =
  () =>
  ({ get }) =>
    pipe(
      get(extendBaseUrl(), languagesByPlaceParams),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(languagesByPlace.decode, E.mapLeft(flow(REST.decodeError))),
      ),
    )
