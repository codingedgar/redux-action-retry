import { AnyAction } from 'redux';
import { CachedAction, RarAction } from '../types';
export declare const GARBAGE_COLLECTOR_PROTOCOL = "@@GARBAGE_COLLECTOR_PROTOCOL";
export interface GarbageCollectorProtocolFn<U = {}> {
    (action: CachedAction<U>): boolean;
}
export declare type GarbageCollectorProtocol<U = {}> = {
    [GARBAGE_COLLECTOR_PROTOCOL]: GarbageCollectorProtocolFn<U>;
};
export declare const COLLECT_GARBAGE = "COLLECT_GARBAGE";
export declare function collectGarbageActionCreator(): CollectGarbageCommand;
export declare type CollectGarbageCommand = RarAction & {
    [COLLECT_GARBAGE]: true;
};
export declare function isCollectGarbageCommand(action: AnyAction): action is CollectGarbageCommand;
export declare function isGarbageCollectorProtocol<U = {}>(action: any): action is GarbageCollectorProtocol<U>;
