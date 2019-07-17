import {
  REDUX_ACTION_RETRY,
  CacheableAction,
  RarAction,
  RETRY_ALL,
  REMOVE
} from '../core';

export const REMOVE_AND_RETRY_ALL = `REMOVE_AND_RETRY_ALL`

export type removeAndRetryAllConfg = {}

export type removeAndRetryAllWrapAction = {}

export function removeAndRetryAllActionCreator(action: CacheableAction): RarAction {
  return {
    type: REDUX_ACTION_RETRY,
    [REMOVE]: action,
    [RETRY_ALL]: true
  }
}