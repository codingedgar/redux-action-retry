import { Config } from "../core/types";
import { UpdatedProtocol } from "../core/protocols/UpdatedProtocol";
import { AppendedProtocol } from "../core/protocols/AppendProtocol";
export declare type timesConfig = {};
export declare const timesKey = "times";
export declare type timesWrapAction = {
    [timesKey]: number;
};
export declare function times(_: Config<timesConfig, timesWrapAction>): UpdatedProtocol<timesWrapAction> & AppendedProtocol<timesWrapAction>;
