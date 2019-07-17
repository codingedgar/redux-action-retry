import {
  append,
  set,
  lensIndex,
  allPass,
  path,
  reject,
  converge,
  mergeAll,
  identity,
  findIndex,
  over,
  lensProp,
  mergeWithKey,
} from 'ramda';

import { Reducer, AnyAction } from 'redux';

export interface State<U> {
  cache: CachedAction<U>[]
}

export const INITIAL_STATE = {
  cache: []
};

export interface ShouldDoBasedOnActionAndCachedAction<U> {
  (action: AnyAction, cachedAction: CachedAction<U>): boolean
}

export interface ActionWrapper<U> {
  (x: CachedAction<U>): U
}

export interface VisitorNode<U> {
  shouldRetryAction?: ShouldDoBasedOnActionAndCachedAction<U>

  actionWrapper?: ActionWrapper<U>

  reducer?: Reducer<State<U>, AnyAction>
}

export type configExtension<T = {}, U = {}> = (config: Config<T, U>) => VisitorNode<U>

export type cacheConfig<T> =
  {
    [s: string]: {
      [P in keyof T]: T[P]
    }
    &
    { type: string; }
  }

export interface Config<T, U> {
  stateKeyName: string,
  cache: cacheConfig<T>
  extensions: configExtension<T, U>[]
}

export const REDUX_ACTION_RETRY = 'REDUX_ACTION_RETRY'
export const RESET = `RESET`
export const RETRY_ALL = `RETRY_ALL`
export const REMOVE = `REMOVE`

export interface CacheableAction extends AnyAction {
  meta: {
    [REDUX_ACTION_RETRY]: {
      id: string
    }
  }
}

export type CachedAction<U> =
  { [P in keyof U]: U[P] }
  &
  { action: CacheableAction }

export type RarAction = {
  type: typeof REDUX_ACTION_RETRY
  [RESET]?: true
  [REMOVE]?: CacheableAction
  [RETRY_ALL]?: true
};

export function resetActionCreator(): RarAction {
  return {
    type: REDUX_ACTION_RETRY,
    [RESET]: true
  }
}

export function removeActionCreator(action: CacheableAction): RarAction {
  return {
    type: REDUX_ACTION_RETRY,
    [REMOVE]: action
  }
}

export function retryAllActionCreator(): RarAction {
  return {
    type: REDUX_ACTION_RETRY,
    [RETRY_ALL]: true
  }
}

export const cacheLens = lensProp('cache')

export function createRetryMechanishm<T, U>(initConfig: Partial<Config<T, U>>) {

  const defaultConfig: Config<T, U> =
  {
    stateKeyName: REDUX_ACTION_RETRY,
    cache: {},
    extensions: [
      upsert,
      reset,
      remove,
    ]
  }


  const config: Config<T,U> = mergeWithKey(
    (k, l, r) => k === 'extensions' ? [...l, ...r] : r,
    defaultConfig,
    initConfig,
  )

  const {
    shouldRetryFunctions,
    reducers,
  } = config.extensions.reduce(
    (acc, extension) => {
      const c = extension(config)

      if (c.shouldRetryAction) {
        acc.shouldRetryFunctions.push(c.shouldRetryAction)
      }

      if (c.reducer) {
        acc.reducers.push(c.reducer)
      }

      return acc
    },
    {
      shouldRetryFunctions: [],
      reducers: [],
    }
  )

  const shouldRetry = allPass(shouldRetryFunctions)

  return {
    stateKeyName: config.stateKeyName,
    reducer: (state: State<U> = INITIAL_STATE, action: AnyAction): State<U> => {

      return reducers.reduce((s, fn) => fn(s, action), state)

    },
    reduxActionRetryMiddleware: ({ getState, dispatch }) => next => (action: AnyAction) => {

      if (action.type === REDUX_ACTION_RETRY && action[RETRY_ALL]) {

        const result = next(action)
        const cache = path<CachedAction<U>[]>([config.stateKeyName, 'cache'], getState())

        cache.forEach(wrap => {
          if (shouldRetry(action, wrap)) {
            dispatch(wrap.action)
          }
        })

        return result;
      } else {
        return next(action)
      }
    }
  }
}

function reset<T, U>(_: Config<T, U>) {
  return {
    reducer: (state: State<U> = INITIAL_STATE, action: AnyAction): State<U> => {
      return (action.type === REDUX_ACTION_RETRY && action[RESET])
        ? INITIAL_STATE
        : state
    }
  }
}

function remove<T, U>(_: Config<T, U>) {
  return {
    reducer: (state: State<U> = INITIAL_STATE, action: AnyAction): State<U> => {

      if (action.type === REDUX_ACTION_RETRY && action[REMOVE]) {

        return over(
          cacheLens,
          reject<CachedAction<U>>(
            cachedAction => cachedAction.action.meta[REDUX_ACTION_RETRY].id === (action as RarAction)[REMOVE].meta[REDUX_ACTION_RETRY].id
          ),
          state
        )
      }

      return state

    }
  }
}

function upsert<T, U>(config: Config<T, U>) {
  const {
    actionWrapperFuns,
  } = config.extensions.reduce(
    (acc, extension) => {
      if (extension != upsert) {

        const c = extension(config)

        if (c.actionWrapper) {
          acc.actionWrapperFuns.push(c.actionWrapper)
        }

      }

      return acc
    },
    {
      actionWrapperFuns: [],
    }
  )

  return {
    reducer: (state: State<U>, action: AnyAction): State<U> => {
      if (config.cache[action.type]) {

        const coincidenceIndex = findIndex(
          (cachedAction =>
            cachedAction.action.meta[REDUX_ACTION_RETRY].id === (action as CacheableAction).meta[REDUX_ACTION_RETRY].id
          ),
          state.cache
        )

        const baseActionWrap =
          (coincidenceIndex < 0)
            ? { action }
            : state.cache[coincidenceIndex]

        const actionWrap: CachedAction<U> = converge((...a) => mergeAll(a), [identity, ...actionWrapperFuns])(baseActionWrap);
        return over(
          cacheLens,
          (cache) => (coincidenceIndex < 0)
            ? append(actionWrap, cache)
            : set(lensIndex(coincidenceIndex), actionWrap)(cache)
          ,
          state
        )
      }
      return state
    }
  }
}