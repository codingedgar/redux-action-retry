import { Config } from "../core";
import { UpdatedProtocol } from "../core/protocols/UpdatedProtocol";
import { AppendedProtocol } from "../core/protocols/AppendProtocol";
export declare type timesConfg = {};
export declare const timesKey = "times";
export declare type timesWrapAction = {
    [timesKey]: number;
};
export declare function times(_: Config<timesConfg, timesWrapAction>): UpdatedProtocol<timesWrapAction> & AppendedProtocol<timesWrapAction>;
