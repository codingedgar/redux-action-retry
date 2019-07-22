"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../core/index");
const now_1 = require("../now");
const UPDATED_PROTOCOL_1 = require("../core/protocols/UPDATED_PROTOCOL");
const APPENDED_PROTOCOL_1 = require("../core/protocols/APPENDED_PROTOCOL");
const RETRY_ALL_PROTOCOL_1 = require("../core/protocols/RETRY_ALL_PROTOCOL");
const upsert_1 = require("../core/upsert");
exports.CANCEL_COOLDOWN = `CANCEL_COOLDOWN`;
exports.COOL_AND_RETRY_ALL = `COOL_AND_RETRY_ALL`;
function coolDownUntil(action, config) {
    return now_1.now().add(config.cache[action.type].cooldownTime);
}
exports.coolDownUntil = coolDownUntil;
function coolAndRetryAllActionCreator() {
    return {
        type: index_1.REDUX_ACTION_RETRY,
        [index_1.RETRY_ALL]: true,
        [exports.COOL_AND_RETRY_ALL]: true,
    };
}
exports.coolAndRetryAllActionCreator = coolAndRetryAllActionCreator;
function cancelCooldownActionCreator(action) {
    return {
        type: index_1.REDUX_ACTION_RETRY,
        [upsert_1.UPSERTED]: action,
        [exports.CANCEL_COOLDOWN]: true,
    };
}
exports.cancelCooldownActionCreator = cancelCooldownActionCreator;
function Cooldown(config) {
    return {
        [RETRY_ALL_PROTOCOL_1.RETRY_ALL_PROTOCOL]: (action, cachedAction) => {
            return (exports.COOL_AND_RETRY_ALL in action)
                ? true
                : now_1.now().isSameOrAfter(cachedAction.coolDownUntil);
        },
        [UPDATED_PROTOCOL_1.UPDATED_PROTOCOL]: (action, cachedAction) => ({
            coolDownUntil: exports.CANCEL_COOLDOWN in action ? now_1.now() : coolDownUntil(cachedAction.action, config)
        }),
        [APPENDED_PROTOCOL_1.APPENDED_PROTOCOL]: (action) => ({
            coolDownUntil: coolDownUntil(action[upsert_1.UPSERTED], config)
        })
    };
}
exports.Cooldown = Cooldown;
