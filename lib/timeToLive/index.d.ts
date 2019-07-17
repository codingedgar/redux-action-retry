import { Config, VisitorNode, CachedAction } from "../core/index";
import { Duration, Moment } from "moment";
export declare type timeToLiveConfg = {
    timeToLive: Duration;
};
export declare const liveUntilKey = "liveUntil";
export declare type timeToLiveWrapAction = {
    [liveUntilKey]: Moment;
};
export declare function liveUntil(wrap: CachedAction<unknown>, config: Config<timeToLiveConfg, timeToLiveWrapAction>): Moment;
export declare function TimeToLive(config: Config<timeToLiveConfg, timeToLiveWrapAction>): VisitorNode<timeToLiveWrapAction>;
