"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cooldown = exports.cancelCooldownActionCreator = exports.coolAndRetryAllActionCreator = exports.coolDownUntil = exports.COOL_AND_RETRY_ALL = exports.CANCEL_COOLDOWN = void 0;
const core_1 = require("../core");
const now_1 = require("../now");
const UpdatedProtocol_1 = require("../core/protocols/UpdatedProtocol");
const AppendProtocol_1 = require("../core/protocols/AppendProtocol");
const RetryAllProtocol_1 = require("../core/protocols/RetryAllProtocol");
const upsert_1 = require("../core/upsert");
exports.CANCEL_COOLDOWN = `CANCEL_COOLDOWN`;
exports.COOL_AND_RETRY_ALL = `COOL_AND_RETRY_ALL`;
function coolDownUntil(action, config) {
    return now_1.now().add(config.cache[action.type].cooldownTime);
}
exports.coolDownUntil = coolDownUntil;
function coolAndRetryAllActionCreator() {
    return {
        type: core_1.REDUX_ACTION_RETRY,
        [core_1.RETRY_ALL]: true,
        [exports.COOL_AND_RETRY_ALL]: true,
    };
}
exports.coolAndRetryAllActionCreator = coolAndRetryAllActionCreator;
function cancelCooldownActionCreator(action) {
    return {
        type: core_1.REDUX_ACTION_RETRY,
        [upsert_1.UPSERTED]: action,
        [exports.CANCEL_COOLDOWN]: true,
    };
}
exports.cancelCooldownActionCreator = cancelCooldownActionCreator;
function Cooldown(config) {
    return {
        [RetryAllProtocol_1.RETRY_ALL_PROTOCOL]: (action, cachedAction) => {
            return (exports.COOL_AND_RETRY_ALL in action)
                ? true
                : now_1.now().isSameOrAfter(cachedAction.coolDownUntil);
        },
        [UpdatedProtocol_1.UPDATED_PROTOCOL]: (action, cachedAction) => ({
            coolDownUntil: exports.CANCEL_COOLDOWN in action ? now_1.now() : coolDownUntil(cachedAction.action, config)
        }),
        [AppendProtocol_1.APPENDED_PROTOCOL]: (action) => ({
            coolDownUntil: coolDownUntil(action[upsert_1.UPSERTED], config)
        })
    };
}
exports.Cooldown = Cooldown;
