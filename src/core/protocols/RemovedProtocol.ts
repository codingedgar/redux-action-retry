import { CachedAction, CacheableAction, REDUX_ACTION_RETRY, RarAction, } from '../types';
import { AnyAction } from 'redux';

export const REMOVED_PROTOCOL = '@@REMOVED_PROTOCOL';

export interface RemoveProtocolFn<U> {
  (action: CachedAction<U>): boolean;
}
export type RemoveProtocol<U> = {
  [REMOVED_PROTOCOL]: RemoveProtocolFn<U>;
};

export const REMOVED = 'REMOVED'

export function removeActionCreator(action: CacheableAction): RemovedEvent {
  return {
    type: REDUX_ACTION_RETRY,
    [REMOVED]: [action]
  }
}

export function removeActionsCreator(actions: CacheableAction[]): RemovedEvent {
  return {
    type: REDUX_ACTION_RETRY,
    [REMOVED]: actions
  }
}

export type RemovedEvent = RarAction & {
  [REMOVED]: readonly CacheableAction[];
};

export function isRemovedEvent(action: AnyAction): action is RemovedEvent {
  return REMOVED in action
}
