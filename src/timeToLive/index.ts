import {
  Config,
  CacheableAction,
} from "../core/types";
import { now } from "../now";

import { Duration, Moment } from "moment";

import { UpdatedProtocol, UPDATED_PROTOCOL } from "../core/protocols/UpdatedProtocol";
import { APPENDED_PROTOCOL, AppendedProtocol } from "../core/protocols/AppendProtocol";
import { UPSERTED } from '../core/upsert';
import { GarbageCollectorProtocol, GARBAGE_COLLECTOR_PROTOCOL } from "../core/protocols/GarbageCollectorProtocol";

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
  GarbageCollectorProtocol<timeToLiveWrapAction>
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
    [GARBAGE_COLLECTOR_PROTOCOL]: (cachedAction) => now().isSameOrAfter(cachedAction[liveUntilKey]),
  }
}