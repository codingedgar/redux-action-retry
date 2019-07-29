
import {
  append,
  set,
  lensIndex,
  findIndex,
  over,
} from 'ramda';

import { AnyAction } from 'redux';

import {
  Config,
  State,
  REDUX_ACTION_RETRY,
  CachedAction,
  INITIAL_STATE,
  RarAction,
  CacheableAction,
} from './types';

import {
  UpdatedProtocolFn,
  UPDATED_PROTOCOL,
  isUpdatedProtocol
} from "./protocols/UpdatedProtocol";

import {
  APPENDED_PROTOCOL,
  AppendedProtocolFn,
  isAppendedProtocol,
  UpsertedAction
} from "./protocols/AppendProtocol";
import { ReducerProtocol } from './protocols/ReducerProtocol';
import { MiddlewareProtocol } from './protocols/MiddlewareProtocol';
import { cacheLens } from './utils';

export const UPSERTED = 'UPSERTED'

export function upsert(config: Config): ReducerProtocol & MiddlewareProtocol {
  return {
    middleware: () => api => next => action => {
      if (config.cache[action.type]) {

        api.dispatch(upsertActionCreator(action as CacheableAction))

        return next(action)
      }
      return next(action)
    },
    reducer: (initializedExtensions) => {

      const [
        appendedProtocols,
        updatedProtocols,
      ] = initializedExtensions.reduce<[
        AppendedProtocolFn[],
        UpdatedProtocolFn[],
      ]>(
        (acc, extension) => {

          if (isAppendedProtocol(extension)) {
            acc[0].push(extension[APPENDED_PROTOCOL])
          }

          if (isUpdatedProtocol(extension)) {
            acc[1].push(extension[UPDATED_PROTOCOL])
          }

          return acc

        },
        [

          [],
          []
        ]
      )

      return (state: State = INITIAL_STATE, action: AnyAction): State => {

        if (isUpsertedAction(action)) {
          const coincidenceIndex = findIndex(
            (cachedAction =>
              cachedAction.action.meta[REDUX_ACTION_RETRY].id === action[UPSERTED].meta[REDUX_ACTION_RETRY].id
            ),
            state.cache
          )

          const actionWrap: CachedAction =
            (coincidenceIndex < 0)
              ? appendedProtocols.reduce(
                (acc, fn) => ({
                  ...acc,
                  ...fn(action),
                }),
                { action: action[UPSERTED] } as CachedAction
              )
              : updatedProtocols.reduce(
                (acc, fn) => ({
                  ...acc,
                  ...fn(action, acc),
                }),
                state.cache[coincidenceIndex]
              )

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
    },
  }
}

type UpsertAction = RarAction & {
  [UPSERTED]: CacheableAction,
}

export function upsertActionCreator(action: CacheableAction): UpsertAction {
  return {
    type: REDUX_ACTION_RETRY,
    [UPSERTED]: action,
  }
}

export function isUpsertedAction(action: AnyAction): action is UpsertedAction {
  return UPSERTED in action;
}

