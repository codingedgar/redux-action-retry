import { Reducer, AnyAction } from 'redux';
import { State } from '../../core/types';
export interface ReducerProtocol<U = {}> {
    reducer: (initializedExtensions: any[]) => Reducer<State<U>, AnyAction>;
}
export declare function isReducerProtocol<U>(extension: any): extension is ReducerProtocol<U>;
