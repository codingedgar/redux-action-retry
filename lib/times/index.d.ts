import { Config, VisitorNode } from "../core/index";
export declare type timesConfg = {};
export declare const timesKey = "times";
export declare type timesWrapAction = {
    [timesKey]: number;
};
export declare function times(_: Config<timesConfg, timesWrapAction>): VisitorNode<timesWrapAction>;
