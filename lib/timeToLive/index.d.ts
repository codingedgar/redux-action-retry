import { Config, CacheableAction } from "../core/index";
import { ReducerProtocol } from "../core/protocols/ReducerProtocol";
import { Duration, Moment } from "moment";
import { UpdatedProtocol } from "../core/protocols/UPDATED_PROTOCOL";
import { AppendedProtocol } from "../core/protocols/APPENDED_PROTOCOL";
import { RetryAllProtocol } from "../core/protocols/RETRY_ALL_PROTOCOL";
export declare type timeToLiveConfg = {
    timeToLive: Duration;
};
export declare const liveUntilKey = "liveUntil";
export declare type timeToLiveWrapAction = {
    [liveUntilKey]: Moment;
};
export declare function liveUntil(action: CacheableAction, config: Config<timeToLiveConfg, timeToLiveWrapAction>): Moment;
export declare function TimeToLive(config: Config<timeToLiveConfg, timeToLiveWrapAction>): RetryAllProtocol<timeToLiveWrapAction> & ReducerProtocol<timeToLiveWrapAction> & AppendedProtocol<timeToLiveWrapAction> & UpdatedProtocol<timeToLiveWrapAction>;
