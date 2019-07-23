import {
  Config,
  REDUX_ACTION_RETRY,
  CacheableAction,
  RETRY_ALL,
  RarAction,
} from "../core";

import { now } from "../now";

import { Duration, Moment } from "moment";
import { UpdatedProtocol, UPDATED_PROTOCOL } from "../core/protocols/UpdatedProtocol";
import { APPENDED_PROTOCOL, AppendedProtocol, UpsertedAction } from "../core/protocols/AppendProtocol";
import { RetryAllProtocol, RETRY_ALL_PROTOCOL, RetryAllCommand } from "../core/protocols/RetryAllProtocol";
import { UPSERTED } from '../core/upsert';

export const CANCEL_COOLDOWN = `CANCEL_COOLDOWN`
export const COOL_AND_RETRY_ALL = `COOL_AND_RETRY_ALL`

export type cancelCooldownAction = RarAction & UpsertedAction & {
  [CANCEL_COOLDOWN]: true
}

export type coolAndRetryAllAction = RarAction & RetryAllCommand & {
  [COOL_AND_RETRY_ALL]: true
};

export type cooldownConfg = {
  cooldownTime: Duration
}

export type cooldownWrapAction = {
  coolDownUntil: Moment
}

export function coolDownUntil(action: CacheableAction, config: Config<cooldownConfg, cooldownWrapAction>): Moment {
  return now().add(config.cache[action.type].cooldownTime)
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
    [UPSERTED]: action,
    [CANCEL_COOLDOWN]: true,
  }
}

export function Cooldown(config: Config<cooldownConfg, cooldownWrapAction>):
  RetryAllProtocol<cooldownWrapAction>
  &
  AppendedProtocol<cooldownWrapAction>
  &
  UpdatedProtocol<cooldownWrapAction> {
  return {
    [RETRY_ALL_PROTOCOL]: (action, cachedAction) => {
      return (COOL_AND_RETRY_ALL in action)
        ? true
        : now().isSameOrAfter(cachedAction.coolDownUntil)
    },
    [UPDATED_PROTOCOL]: (action, cachedAction) => ({
      coolDownUntil: CANCEL_COOLDOWN in action ? now() : coolDownUntil(cachedAction.action, config)
    }),
    [APPENDED_PROTOCOL]: (action) => ({
      coolDownUntil: coolDownUntil(action[UPSERTED], config)
    })
  }
}