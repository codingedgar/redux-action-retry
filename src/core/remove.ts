import {
  reject,
  over,
  anyPass,
  find,
} from 'ramda';
import {
  Config,
  State,
  INITIAL_STATE,
  REDUX_ACTION_RETRY,
  CachedAction,
  CacheableAction,
  RarAction,
} from '.';

import { AnyAction } from 'redux';
import { cacheLens } from './utils';
import { REMOVED, isRemovedEvent } from './protocols/REMOVED_PROTOCOL';

export function remove(_config: Config) {
  return {
    reducer: () =>
      (state: State = INITIAL_STATE, action: AnyAction): State => {
        if (isRemovedEvent(action)) {
          return over(
            cacheLens,
            reject<CachedAction>(
              anyPass([
                cachedAction => !!find(
                  removedAction => {
                    return  removedAction.meta[REDUX_ACTION_RETRY].id ===  cachedAction.action.meta[REDUX_ACTION_RETRY].id
                  }
                  , action[REMOVED]),
              ])
            ),
            state
          )

        }

        return state

      }
  }
}