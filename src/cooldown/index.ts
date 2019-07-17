import {
  findIndex,
  lensPath,
  set,
} from 'ramda';

import {
  Config,
  VisitorNode,
  CachedAction,
  REDUX_ACTION_RETRY,
  CacheableAction,
  RETRY_ALL,
  RarAction,
} from "../core/index";

import { now } from "../now";

import { Duration, Moment } from "moment";

export const CANCEL_COOLDOWN = `CANCEL_COOLDOWN`
export const COOL_AND_RETRY_ALL = `COOL_AND_RETRY_ALL`

export type cancelCooldownAction = RarAction & {
  [CANCEL_COOLDOWN]: CacheableAction
}

export type coolAndRetryAllAction = RarAction & {
  [COOL_AND_RETRY_ALL]: true
};

export type cooldownConfg = {
  cooldownTime: Duration
}

export const coolDownUntilKey = 'coolDownUntil';

export type cooldownWrapAction = {
  [coolDownUntilKey]: Moment
}

export function coolDownUntil(wrap: CachedAction<unknown>, config: Config<cooldownConfg, cooldownWrapAction>): Moment {
  return now().add(config.cache[wrap.action.type].cooldownTime)
}

export function coolAndRetryAllActionCreator(): coolAndRetryAllAction {
  return {
    type: REDUX_ACTION_RETRY,
    [RETRY_ALL]: true,
    [COOL_AND_RETRY_ALL]: true,
  }
}

export function cancelCooldownActionCreator(action: CacheableAction): cancelCooldownAction {
  return {
    type: REDUX_ACTION_RETRY,
    [CANCEL_COOLDOWN]: action
  }
}

export function Cooldown(config: Config<cooldownConfg, cooldownWrapAction>): VisitorNode<cooldownWrapAction> {
  return {
    shouldRetryAction(action, cachedAction) {
      return (action[COOL_AND_RETRY_ALL])
        ? true
        : now().isSameOrAfter(cachedAction[coolDownUntilKey])
    },
    actionWrapper(action) {
      return {
        [coolDownUntilKey]: coolDownUntil(action, config)
      }
    },
    reducer: (state, action) => {
      if (action.type === REDUX_ACTION_RETRY && action[CANCEL_COOLDOWN]) {

        const cancelCooldownAction = action as cancelCooldownAction

        const coincidenceIndex = findIndex(
          (cachedAction =>
            cachedAction.action.meta[REDUX_ACTION_RETRY].id === cancelCooldownAction[CANCEL_COOLDOWN].meta[REDUX_ACTION_RETRY].id
          ),
          state.cache
        )

        return (coincidenceIndex < 0)
          ? state
          : set(
            lensPath(['cache', coincidenceIndex, coolDownUntilKey]),
            now()
            ,
            state
          )
      }

      return state

    }
  }
}