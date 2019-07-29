import { CachedAction, RETRY_ALL, RarAction } from '../types';
export declare const RETRY_ALL_PROTOCOL = "@@RETRY_ALL_PROTOCOL";
export interface RetryAllProtocolFn<U = {}> {
    (action: RetryAllCommand, cachedAction: CachedAction<U>): boolean;
}
export declare type RetryAllProtocol<U = {}> = {
    [RETRY_ALL_PROTOCOL]: RetryAllProtocolFn<U>;
};
export declare type RetryAllCommand = RarAction & {
    [RETRY_ALL]: true;
};
export declare function isRetryAllProtocol(action: any): action is RetryAllProtocol;
