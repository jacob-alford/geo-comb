import * as Axios_ from 'axios'
import * as t from 'io-ts'
import { failure } from 'io-ts/PathReporter'
import * as TE from 'fp-ts/TaskEither'
import * as Sh from 'fp-ts/Show'

const { default: Axios } = Axios_

export interface ApiError {
  _tag: 'ApiError'
  error: unknown
}

export const apiError: (e: unknown) => RestError = error => ({
  _tag: 'ApiError',
  error,
})

export interface DecodeError {
  _tag: 'DecodeError'
  error: t.Errors
}

export const decodeError: (e: t.Errors) => RestError = error => ({
  _tag: 'DecodeError',
  error,
})

export type RestError = ApiError | DecodeError

export interface FetchMethods {
  get: <P extends object>(
    url: string,
    params?: P,
  ) => TE.TaskEither<RestError, Axios_.AxiosResponse>
  post: <P extends object, D extends object>(
    url: string,
    params?: P,
    data?: D,
  ) => TE.TaskEither<RestError, Axios_.AxiosResponse>
}

export const env: FetchMethods = {
  get: (url, params) =>
    TE.tryCatchK(() => Axios.get(url, { params }), apiError)(),
  post: (url, params, data) =>
    TE.tryCatchK(() => Axios.post(url, { params, data }), apiError)(),
}

export const Show: Sh.Show<RestError> = {
  show: e => {
    switch (e._tag) {
      case 'ApiError':
        return JSON.stringify(e.error, null, 2)
      case 'DecodeError':
        return JSON.stringify(e.error, null, 2)
    }
  },
}
