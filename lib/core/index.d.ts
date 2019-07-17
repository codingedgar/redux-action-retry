/// <reference types="ramda" />
import { Reducer, AnyAction } from 'redux';
export interface State<U> {
    cache: CachedAction<U>[];
}
export declare const INITIAL_STATE: {
    cache: any[];
};
export interface ShouldDoBasedOnActionAndCachedAction<U> {
    (action: AnyAction, cachedAction: CachedAction<U>): boolean;
}
export interface ActionWrapper<U> {
    (x: CachedAction<U>): U;
}
export interface VisitorNode<U> {
    shouldRetryAction?: ShouldDoBasedOnActionAndCachedAction<U>;
    actionWrapper?: ActionWrapper<U>;
    reducer?: Reducer<State<U>, AnyAction>;
}
export declare type configExtension<T = {}, U = {}> = (config: Config<T, U>) => VisitorNode<U>;
export declare type cacheConfig<T> = {
    [s: string]: {
        [P in keyof T]: T[P];
    } & {
        type: string;
    };
};
export interface Config<T, U> {
    stateKeyName: string;
    cache: cacheConfig<T>;
    extensions: configExtension<T, U>[];
}
export declare const REDUX_ACTION_RETRY = "REDUX_ACTION_RETRY";
export declare const RESET = "RESET";
export declare const RETRY_ALL = "RETRY_ALL";
export declare const REMOVE = "REMOVE";
export interface CacheableAction extends AnyAction {
    meta: {
        [REDUX_ACTION_RETRY]: {
            id: string;
        };
    };
}
export declare type CachedAction<U> = {
    [P in keyof U]: U[P];
} & {
    action: CacheableAction;
};
export declare type RarAction = {
    type: typeof REDUX_ACTION_RETRY;
    [RESET]?: true;
    [REMOVE]?: CacheableAction;
    [RETRY_ALL]?: true;
};
export declare function resetActionCreator(): RarAction;
export declare function removeActionCreator(action: CacheableAction): RarAction;
export declare function retryAllActionCreator(): RarAction;
export declare const cacheLens: {
    <T, U>(obj: T): U;
    set<T, U, V>(val: T, obj: U): V;
};
export declare function createRetryMechanishm<T, U>(initConfig: Partial<Config<T, U>>): {
    stateKeyName: string;
    reducer: (state: State<U>, action: AnyAction) => State<U>;
    reduxActionRetryMiddleware: ({ getState, dispatch }: {
        getState: any;
        dispatch: any;
    }) => (next: any) => (action: AnyAction) => any;
};
