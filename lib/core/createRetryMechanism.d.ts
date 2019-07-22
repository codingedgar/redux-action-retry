import { Config, State } from '.';
import { Reducer, Middleware } from 'redux';
declare type RetryMechanishm<T, U> = {
    stateKeyName: string;
    reducer: Reducer<State<U>>;
    reduxActionRetryMiddleware: Middleware<State<U>>[];
};
export declare function createRetryMechanishm<T, U>(initConfig: Partial<Config<T, U>>): RetryMechanishm<T, U>;
export {};
