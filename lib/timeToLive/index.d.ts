import { Config, CacheableAction } from "../core/types";
import { Duration, Moment } from "moment";
import { UpdatedProtocol } from "../core/protocols/UpdatedProtocol";
import { AppendedProtocol } from "../core/protocols/AppendProtocol";
import { GarbageCollectorProtocol } from "../core/protocols/GarbageCollectorProtocol";
export declare type timeToLiveConfg = {
    timeToLive: Duration;
};
export declare const liveUntilKey = "liveUntil";
export declare type timeToLiveWrapAction = {
    [liveUntilKey]: Moment;
};
export declare function liveUntil(action: CacheableAction, config: Config<timeToLiveConfg, timeToLiveWrapAction>): Moment;
export declare function TimeToLive(config: Config<timeToLiveConfg, timeToLiveWrapAction>): GarbageCollectorProtocol<timeToLiveWrapAction> & AppendedProtocol<timeToLiveWrapAction> & UpdatedProtocol<timeToLiveWrapAction>;
