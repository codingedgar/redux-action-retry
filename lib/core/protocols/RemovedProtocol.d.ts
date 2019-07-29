import { CachedAction, CacheableAction, RarAction } from '../types';
import { AnyAction } from 'redux';
export declare const REMOVED_PROTOCOL = "@@REMOVED_PROTOCOL";
export interface RemoveProtocolFn<U> {
    (action: CachedAction<U>): boolean;
}
export declare type RemoveProtocol<U> = {
    [REMOVED_PROTOCOL]: RemoveProtocolFn<U>;
};
export declare const REMOVED = "REMOVED";
export declare function removeActionCreator(action: CacheableAction): RemovedEvent;
export declare function removeActionsCreator(actions: CacheableAction[]): RemovedEvent;
export declare type RemovedEvent = RarAction & {
    [REMOVED]: readonly CacheableAction[];
};
export declare function isRemovedEvent(action: AnyAction): action is RemovedEvent;
