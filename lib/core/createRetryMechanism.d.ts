import { Config, State } from './types';
import { Reducer, Middleware } from 'redux';
declare type RetryMechanism<T, U> = {
    stateKeyName: string;
    reducer: Reducer<State<U>>;
    reduxActionRetryMiddlewares: Middleware<State<U>>[];
};
export declare function createRetryMechanism<T, U>(initConfig: Partial<Config<T, U>>): RetryMechanism<T, U>;
export {};
