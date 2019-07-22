import { Config } from "../core/index";
import { UpdatedProtocol } from "../core/protocols/UPDATED_PROTOCOL";
import { AppendedProtocol } from "../core/protocols/APPENDED_PROTOCOL";
export declare type timesConfg = {};
export declare const timesKey = "times";
export declare type timesWrapAction = {
    [timesKey]: number;
};
export declare function times(_: Config<timesConfg, timesWrapAction>): UpdatedProtocol<timesWrapAction> & AppendedProtocol<timesWrapAction>;
