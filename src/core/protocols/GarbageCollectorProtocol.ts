import { AnyAction } from 'redux';
import { REDUX_ACTION_RETRY, CachedAction, RarAction } from '../types';

export const GARBAGE_COLLECTOR_PROTOCOL = '@@GARBAGE_COLLECTOR_PROTOCOL';

export interface GarbageCollectorProtocolFn<U = {}> {
  (action: CachedAction<U>): boolean;
}
export type GarbageCollectorProtocol<U = {}> = {
  [GARBAGE_COLLECTOR_PROTOCOL]: GarbageCollectorProtocolFn<U>;
};

export const COLLECT_GARBAGE = 'COLLECT_GARBAGE'

export function collectGarbageActionCreator(): CollectGarbageCommand {
  return {
    type: REDUX_ACTION_RETRY,
    [COLLECT_GARBAGE]: true,
  }
}

export type CollectGarbageCommand = RarAction & {
  [COLLECT_GARBAGE]: true
};

export function isCollectGarbageCommand(action: AnyAction): action is CollectGarbageCommand {
  return COLLECT_GARBAGE in action
}

export function isGarbageCollectorProtocol<U = {}>(action: any): action is GarbageCollectorProtocol<U> {
  return GARBAGE_COLLECTOR_PROTOCOL in action
}