import { Config, CacheableAction, RarAction } from "../core";
import { Duration, Moment } from "moment";
import { UpdatedProtocol } from "../core/protocols/UpdatedProtocol";
import { AppendedProtocol, UpsertedAction } from "../core/protocols/AppendProtocol";
import { RetryAllProtocol, RetryAllCommand } from "../core/protocols/RetryAllProtocol";
export declare const CANCEL_COOLDOWN = "CANCEL_COOLDOWN";
export declare const COOL_AND_RETRY_ALL = "COOL_AND_RETRY_ALL";
export declare type cancelCooldownAction = RarAction & UpsertedAction & {
    [CANCEL_COOLDOWN]: true;
};
export declare type coolAndRetryAllAction = RarAction & RetryAllCommand & {
    [COOL_AND_RETRY_ALL]: true;
};
export declare type cooldownConfg = {
    cooldownTime: Duration;
};
export declare type cooldownWrapAction = {
    coolDownUntil: Moment;
};
export declare function coolDownUntil(action: CacheableAction, config: Config<cooldownConfg, cooldownWrapAction>): Moment;
export declare function coolAndRetryAllActionCreator(): coolAndRetryAllAction;
export declare function cancelCooldownActionCreator(action: CacheableAction): cancelCooldownAction;
export declare function Cooldown(config: Config<cooldownConfg, cooldownWrapAction>): RetryAllProtocol<cooldownWrapAction> & AppendedProtocol<cooldownWrapAction> & UpdatedProtocol<cooldownWrapAction>;
