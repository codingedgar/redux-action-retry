import { AnyAction } from 'redux';
import { Config } from '.';
import { RarAction, CacheableAction } from '.';
import { UpsertedAction } from "./protocols/APPENDED_PROTOCOL";
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
