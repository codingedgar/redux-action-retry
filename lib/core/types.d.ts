import { AnyAction } from 'redux';
export interface State<U = {}> {
    cache: CachedAction<U>[];
}
export declare const INITIAL_STATE: {
    cache: never[];
};
export declare type configExtension<T = {}, U = {}> = (config: Config<T, U>) => any;
export declare type cacheConfig<T> = {
    [s: string]: {
        [P in keyof T]: T[P];
    } & {
        type: string;
    };
};
export interface Config<T = {}, U = {}> {
    stateKeyName: string;
    cache: cacheConfig<T>;
    extensions: configExtension<T, U>[];
}
export declare const REDUX_ACTION_RETRY = "REDUX_ACTION_RETRY";
export declare const RETRY_ALL = "RETRY_ALL";
export interface CacheableAction extends AnyAction {
    meta: {
        [REDUX_ACTION_RETRY]: {
            id: string;
        };
    };
}
export declare type CachedAction<U = {}> = {
    [P in keyof U]: U[P];
} & {
    action: CacheableAction;
};
export declare type RarAction = {
    type: typeof REDUX_ACTION_RETRY;
};
