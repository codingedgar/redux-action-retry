import {
  Config,
  VisitorNode,
  CachedAction,
  REDUX_ACTION_RETRY,
  cacheLens,
  RETRY_ALL,
} from "../core/index";
import { over, reject } from "ramda";
import { now } from "../now";

import { Duration, Moment } from "moment";

export type timeToLiveConfg = {
  timeToLive: Duration
}

export const liveUntilKey = 'liveUntil'

export type timeToLiveWrapAction = {
  [liveUntilKey]: Moment
}

export function liveUntil(wrap: CachedAction<unknown>, config: Config<timeToLiveConfg, timeToLiveWrapAction>): Moment {
  return now().add(config.cache[wrap.action.type].timeToLive)
}

export function TimeToLive(config: Config<timeToLiveConfg, timeToLiveWrapAction>): VisitorNode<timeToLiveWrapAction> {
  return {
    actionWrapper(action) {
      return {
        [liveUntilKey]: liveUntil(action, config)
      }
    },
    shouldRetryAction(_, cachedAction) {
      return now().isBefore(cachedAction[liveUntilKey])
    },
    reducer(state, action) {

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