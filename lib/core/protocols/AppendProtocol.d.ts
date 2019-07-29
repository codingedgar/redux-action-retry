import { UPSERTED } from '../upsert';
import { RarAction, REDUX_ACTION_RETRY, CacheableAction } from '../types';
export declare const APPENDED_PROTOCOL = "@@APPENDED_PROTOCOL";
export interface AppendedProtocolFn<U = {}> {
    (action: UpsertedAction): U;
}
export declare type AppendedProtocol<U = {}> = {
    [APPENDED_PROTOCOL]: AppendedProtocolFn<U>;
};
export declare type UpsertedAction = RarAction & {
    type: typeof REDUX_ACTION_RETRY;
    [UPSERTED]: CacheableAction;
};
export declare function isAppendedProtocol<U = {}>(extension: any): extension is AppendedProtocol<U>;
