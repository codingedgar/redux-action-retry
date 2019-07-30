import {
  mergeWithKey,
} from 'ramda';

import {
  Config,
  REDUX_ACTION_RETRY,
  State,
  INITIAL_STATE,
} from './types';

import { upsert } from './upsert';
import { reset } from './reset';
import { remove } from './remove';
import { Reducer, AnyAction, Middleware } from 'redux';
import { retryAll } from './retryAll';
import { ReducerProtocol, isReducerProtocol } from './protocols/ReducerProtocol';
import { MiddlewareProtocol, isMiddleware } from './protocols/MiddlewareProtocol';
import { garbageCollector } from './garbageCollector';

type RetryMechanism<T, U> = {
  stateKeyName: string,
  reducer: Reducer<State<U>>,
  reduxActionRetryMiddlewares: Middleware<State<U>>[]
}

export function createRetryMechanism<T, U>(initConfig: Partial<Config<T, U>>): RetryMechanism<T, U> {

  const defaultConfig: Config =
  {
    stateKeyName: REDUX_ACTION_RETRY,
    cache: {},
    extensions: [
      upsert,
      reset,
      remove,
      retryAll,
      garbageCollector
    ]
  }

  const config: Config<T, U> = mergeWithKey(
    (k, l, r) => k === 'extensions' ? [...l, ...r] : r,
    defaultConfig,
    initConfig,
  )

  const hotExtensions = config.extensions.map(e => e(config))
  const [protocols, visitors, middlewares] = hotExtensions.reduce<[ReducerProtocol<U>[], any[], MiddlewareProtocol<U>[]]>(
    (acc, ext) => {
      if (isReducerProtocol<U>(ext)) {
        acc[0].push(ext)
      }

      acc[1].push(ext)

      if (isMiddleware<U>(ext)) {
        acc[2].push(ext)
      }
      return acc
    },
    [[], [], []]
  )

  const reducers = protocols.reduce<Reducer<State<U>, AnyAction>[]>(
    (acc, protocol) => {

      acc.push(protocol.reducer(visitors))

      return acc
    },
    []
  )

  return {
    stateKeyName: config.stateKeyName,
    reducer: function (state: State<U> = INITIAL_STATE, action: AnyAction): State<U> {

      return reducers.reduce((s, fn) => fn(s, action), state)

    },
    reduxActionRetryMiddlewares: [
      ...middlewares.map(m => m.middleware(visitors)),
    ]
  }
}
