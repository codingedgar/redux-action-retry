import { CacheableAction, RarAction } from '../core';
import { RemovedEvent } from '../core/protocols/REMOVED_PROTOCOL';
import { RetryAllCommand } from '../core/protocols/RETRY_ALL_PROTOCOL';
export declare const REMOVE_AND_RETRY_ALL = "REMOVE_AND_RETRY_ALL";
export declare type removeAndRetryAllConfg = {};
export declare type removeAndRetryAllWrapAction = {};
export declare function removeAndRetryAllActionCreator(action: CacheableAction): RarAction & RemovedEvent & RetryAllCommand;
