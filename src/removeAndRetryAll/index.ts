import {
  REDUX_ACTION_RETRY,
  CacheableAction,
  RarAction,
  RETRY_ALL,
} from '../core';
import { RemovedEvent, REMOVED } from '../core/protocols/REMOVED_PROTOCOL';
import { RetryAllCommand } from '../core/protocols/RETRY_ALL_PROTOCOL';

export const REMOVE_AND_RETRY_ALL = `REMOVE_AND_RETRY_ALL`

export type removeAndRetryAllConfg = {}

export type removeAndRetryAllWrapAction = {}

export function removeAndRetryAllActionCreator(action: CacheableAction): RarAction & RemovedEvent & RetryAllCommand {
  return {
    type: REDUX_ACTION_RETRY,
    [REMOVED]: [action],
    [RETRY_ALL]: true
  }
}