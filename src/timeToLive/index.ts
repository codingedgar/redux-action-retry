import {
  Config,
  // VisitorNode,
  CachedAction,
  REDUX_ACTION_RETRY,
  RETRY_ALL,
  CacheableAction,
  INITIAL_STATE,
} from "../core/index";
import { ReducerProtocol } from "../core/protocols/ReducerProtocol";
import { over, reject } from "ramda";
import { now } from "../now";

import { Duration, Moment } from "moment";

import { UpdatedProtocol, UPDATED_PROTOCOL } from "../core/protocols/UPDATED_PROTOCOL";
import { APPENDED_PROTOCOL, AppendedProtocol } from "../core/protocols/APPENDED_PROTOCOL";
import { RetryAllProtocol, RETRY_ALL_PROTOCOL } from "../core/protocols/RETRY_ALL_PROTOCOL";
import { UPSERTED } from '../core/upsert';
import { cacheLens } from '../core/utils';

export type timeToLiveConfg = {
  timeToLive: Duration
}

export const liveUntilKey = 'liveUntil'

export type timeToLiveWrapAction = {
  [liveUntilKey]: Moment
}

export function liveUntil(action: CacheableAction, config: Config<timeToLiveConfg, timeToLiveWrapAction>): Moment {
  return now().add(config.cache[action.type].timeToLive)
}

export function TimeToLive(config: Config<timeToLiveConfg, timeToLiveWrapAction>):
  RetryAllProtocol<timeToLiveWrapAction>
  &
  ReducerProtocol<timeToLiveWrapAction>
  &
  AppendedProtocol<timeToLiveWrapAction>
  &
  UpdatedProtocol<timeToLiveWrapAction> {
  return {
    [UPDATED_PROTOCOL]: (_, cachedAction) => ({
      [liveUntilKey]: liveUntil(cachedAction.action, config)
    }),
    [APPENDED_PROTOCOL]: (action) => ({
      [liveUntilKey]: liveUntil(action[UPSERTED], config)
    }),
    [RETRY_ALL_PROTOCOL]: (_, cachedAction) => {
      return now().isBefore(cachedAction[liveUntilKey])
    },
    reducer: () => (state = INITIAL_STATE, action) => {

      if (action.type === REDUX_ACTION_RETRY && action[RETRY_ALL]) {
        const valueOfNow = now()

        return over(
          cacheLens,
          reject<CachedAction<timeToLiveWrapAction>>(
            cachedAction => valueOfNow.isSameOrAfter(cachedAction[liveUntilKey])
          ),
          state
        )

      }

      return state
    }
  }
}