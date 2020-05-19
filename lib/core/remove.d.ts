import { Config, State } from './types';
import { AnyAction } from 'redux';
export declare function remove(_config: Config): {
    reducer: () => (state: State<{}> | undefined, action: AnyAction) => State;
};
