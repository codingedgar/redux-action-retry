import { CacheableAction, RarAction } from '../core';
export declare const REMOVE_AND_RETRY_ALL = "REMOVE_AND_RETRY_ALL";
export declare type removeAndRetryAllConfg = {};
export declare type removeAndRetryAllWrapAction = {};
export declare function removeAndRetryAllActionCreator(action: CacheableAction): RarAction;
