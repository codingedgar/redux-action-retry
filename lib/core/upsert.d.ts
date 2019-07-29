import { AnyAction } from 'redux';
import { Config, RarAction, CacheableAction } from './types';
import { UpsertedAction } from "./protocols/AppendProtocol";
import { ReducerProtocol } from './protocols/ReducerProtocol';
import { MiddlewareProtocol } from './protocols/MiddlewareProtocol';
export declare const UPSERTED = "UPSERTED";
export declare function upsert(config: Config): ReducerProtocol & MiddlewareProtocol;
declare type UpsertAction = RarAction & {
    [UPSERTED]: CacheableAction;
};
export declare function upsertActionCreator(action: CacheableAction): UpsertAction;
export declare function isUpsertedAction(action: AnyAction): action is UpsertedAction;
export {};
