import { Config, State, RarAction } from '.';
import { AnyAction } from 'redux';
export declare const RESET = "RESET";
export declare function reset(_: Config): {
    reducer: () => (state: State<{}> | undefined, action: AnyAction) => State<{}>;
};
declare type resetCommand = RarAction & {
    [RESET]: true;
};
export declare function resetActionCreator(): resetCommand;
export {};
