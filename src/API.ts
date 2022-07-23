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

///////////////////////////////////////////
//  Get demographics by Place ID
///////////////////////////////////////////
export interface DemographicsByPlaceIdParams {
  year: 'latest'
  measure: 'Hispanic Population,Hispanic Population Moe'
  drilldowns: 'Race,Ethnicity'
  Geography: string
}

export const demographicsByPlaceIdParams: (
  Geography: string,
) => DemographicsByPlaceIdParams = (Geography: string) => ({
  year: 'latest',
  measure: 'Hispanic Population,Hispanic Population Moe',
  drilldowns: 'Race,Ethnicity',
  Geography,
})

interface GeographyIdDemographic {
  'ID Race': number
  Race: string
  'ID Ethnicity': number
  Ethnicity: string
  'ID Year': number
  Year: string
  'Hispanic Population': number
  'Hispanic Population Moe': number
  Geography: string
  'ID Geography': string
  'Slug Geography': string
}

interface DemographicsByGeographyId {
  data: ReadonlyArray<GeographyIdDemographic>
}

const geographyIdDemographic = t.type({
  data: t.array(
    t.type({
      'ID Race': t.number,
      Race: t.string,
      'ID Ethnicity': t.number,
      Ethnicity: t.string,
      'ID Year': t.number,
      Year: t.string,
      'Hispanic Population': t.number,
      'Hispanic Population Moe': t.number,
      Geography: t.string,
      'ID Geography': t.string,
      'Slug Geography': t.string,
    }),
  ),
})

export const getDemographicsByPlaceId: (
  Geograpy: string,
) => RTE.ReaderTaskEither<Env, REST.RestError, DemographicsByGeographyId> =
  Geography =>
  ({ get }) =>
    pipe(
      get(extendBaseUrl(), demographicsByPlaceIdParams(Geography)),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(geographyIdDemographic.decode, E.mapLeft(flow(REST.decodeError))),
      ),
    )

///////////////////////////////////////////
//  Total Foreign Population by GeographyId
///////////////////////////////////////////
export interface TotalForeignPopulationByGeographyIdParam {
  Geography: string
  Nativity: 2
  measure: 'Total Population'
  drilldowns: 'State,Birthplace'
  year: 'latest'
}

const totalForeignPopulationByByGeographyIdParams: (
  geographyId: string,
) => TotalForeignPopulationByGeographyIdParam = Geography => ({
  Geography,
  Nativity: 2,
  measure: 'Total Population',
  drilldowns: 'State,Birthplace',
  year: 'latest',
})

interface ForeignPopulationByGeographyId {
  'ID Birthplace': number
  Birthplace: string
  'ID Year': number
  Year: string
  'ID Nativity': number
  Nativity: string
  'Total Population': number
  Geography: string
  'ID Geography': string
  'Slug Geography': string
}

interface ForeignPopulationByGeographyIdResponse {
  data: ReadonlyArray<ForeignPopulationByGeographyId>
}

const foreignPopulationByGeographyIdResponse = t.type({
  data: t.array(
    t.type({
      'ID Birthplace': t.number,
      Birthplace: t.string,
      'ID Year': t.number,
      Year: t.string,
      'ID Nativity': t.number,
      Nativity: t.string,
      'Total Population': t.number,
      Geography: t.string,
      'ID Geography': t.string,
      'Slug Geography': t.string,
    }),
  ),
})

export const getForeignPopulationByGeographyIdResponse: (
  geographyId: string,
) => RTE.ReaderTaskEither<
  Env,
  REST.RestError,
  ForeignPopulationByGeographyIdResponse
> =
  geographyId =>
  ({ get }) =>
    pipe(
      get(
        extendBaseUrl(),
        totalForeignPopulationByByGeographyIdParams(geographyId),
      ),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(
          foreignPopulationByGeographyIdResponse.decode,
          E.mapLeft(flow(REST.decodeError)),
        ),
      ),
    )

///////////////////////////////////////////
//  Property Value and Population by Place
///////////////////////////////////////////
export interface PropertyValueByPlaceParams {
  year: 'latest'
  drilldowns: 'Place'
  measure: 'Property Value,Property Value Moe,Population'
}

const propertyValueByPlaceParams: PropertyValueByPlaceParams = {
  year: 'latest',
  drilldowns: 'Place',
  measure: 'Property Value,Property Value Moe,Population',
}

export interface PlaceValuePopulation {
  'ID Place': string
  Place: string
  'ID Year': number
  Year: string
  'Property Value': number
  'Property Value Moe': number | null
  'Slug Place': string
  Population: number
}

interface PropertyValueByPlace {
  data: ReadonlyArray<PlaceValuePopulation>
}

const propertyValueByPlace = t.type({
  data: t.array(
    t.type({
      'ID Place': t.string,
      Place: t.string,
      'ID Year': t.number,
      Year: t.string,
      'Property Value': t.number,
      'Property Value Moe': t.union([t.null, t.number]),
      'Slug Place': t.string,
      Population: t.number,
    }),
  ),
})

export const getPropertyValueByPlace: () => RTE.ReaderTaskEither<
  Env,
  REST.RestError,
  PropertyValueByPlace
> =
  () =>
  ({ get }) =>
    pipe(
      get(extendBaseUrl(), propertyValueByPlaceParams),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(propertyValueByPlace.decode, E.mapLeft(flow(REST.decodeError))),
      ),
    )

///////////////////////////////////////////
//  Chronically Homeless Individuals By State
///////////////////////////////////////////
export interface ChronicallyHomelessByStateParams {
  drilldowns: 'State'
  measure: 'Estimates of Chronically Homeless Individuals,Population'
  year: 2017
}

const chronicallyHomelessByStateParams: ChronicallyHomelessByStateParams = {
  drilldowns: 'State',
  measure: 'Estimates of Chronically Homeless Individuals,Population',
  year: 2017,
}

export interface ChronicallyHomelessStateData {
  'Estimates of Chronically Homeless Individuals'?: number
  'ID State': string
  'ID Year': number
  'Slug State': string
  State: string
  Year: string
  Population: number
}

interface ChronicallyHomelessByState {
  data: ReadonlyArray<ChronicallyHomelessStateData>
}

const chronicallyHomelessByState = t.type({
  data: t.array(
    t.type({
      'Estimates of Chronically Homeless Individuals': t.union([
        t.number,
        t.undefined,
      ]),
      'ID State': t.string,
      'ID Year': t.number,
      'Slug State': t.string,
      State: t.string,
      Year: t.string,
      Population: t.number,
    }),
  ),
})

export const getChronicallyHomelessByState: () => RTE.ReaderTaskEither<
  Env,
  REST.RestError,
  ChronicallyHomelessByState
> =
  () =>
  ({ get }) =>
    pipe(
      get(extendBaseUrl(), chronicallyHomelessByStateParams),
      TE.map(a => a.data),
      TE.chainEitherK(
        flow(
          chronicallyHomelessByState.decode,
          E.mapLeft(flow(REST.decodeError)),
        ),
      ),
    )
