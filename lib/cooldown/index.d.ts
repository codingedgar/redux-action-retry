import { Config, VisitorNode, CachedAction, CacheableAction, RarAction } from "../core/index";
import { Duration, Moment } from "moment";
export declare const CANCEL_COOLDOWN = "CANCEL_COOLDOWN";
export declare const COOL_AND_RETRY_ALL = "COOL_AND_RETRY_ALL";
export declare type cancelCooldownAction = RarAction & {
    [CANCEL_COOLDOWN]: CacheableAction;
};
export declare type coolAndRetryAllAction = RarAction & {
    [COOL_AND_RETRY_ALL]: true;
};
export declare type cooldownConfg = {
    cooldownTime: Duration;
};
export declare const coolDownUntilKey = "coolDownUntil";
export declare type cooldownWrapAction = {
    [coolDownUntilKey]: Moment;
};
export declare function coolDownUntil(wrap: CachedAction<unknown>, config: Config<cooldownConfg, cooldownWrapAction>): Moment;
export declare function coolAndRetryAllActionCreator(): coolAndRetryAllAction;
export declare function cancelCooldownActionCreator(action: CacheableAction): cancelCooldownAction;
export declare function Cooldown(config: Config<cooldownConfg, cooldownWrapAction>): VisitorNode<cooldownWrapAction>;
