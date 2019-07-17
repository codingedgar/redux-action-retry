"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const index_1 = require("../core/index");
const now_1 = require("../now");
exports.CANCEL_COOLDOWN = `CANCEL_COOLDOWN`;
exports.COOL_AND_RETRY_ALL = `COOL_AND_RETRY_ALL`;
exports.coolDownUntilKey = 'coolDownUntil';
function coolDownUntil(wrap, config) {
    return now_1.now().add(config.cache[wrap.action.type].cooldownTime);
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
        [exports.CANCEL_COOLDOWN]: action
    };
}
exports.cancelCooldownActionCreator = cancelCooldownActionCreator;
function Cooldown(config) {
    return {
        shouldRetryAction(action, cachedAction) {
            return (action[exports.COOL_AND_RETRY_ALL])
                ? true
                : now_1.now().isSameOrAfter(cachedAction[exports.coolDownUntilKey]);
        },
        actionWrapper(action) {
            return {
                [exports.coolDownUntilKey]: coolDownUntil(action, config)
            };
        },
        reducer: (state, action) => {
            if (action.type === index_1.REDUX_ACTION_RETRY && action[exports.CANCEL_COOLDOWN]) {
                const cancelCooldownAction = action;
                const coincidenceIndex = ramda_1.findIndex((cachedAction => cachedAction.action.meta[index_1.REDUX_ACTION_RETRY].id === cancelCooldownAction[exports.CANCEL_COOLDOWN].meta[index_1.REDUX_ACTION_RETRY].id), state.cache);
                return (coincidenceIndex < 0)
                    ? state
                    : ramda_1.set(ramda_1.lensPath(['cache', coincidenceIndex, exports.coolDownUntilKey]), now_1.now(), state);
            }
            return state;
        }
    };
}
exports.Cooldown = Cooldown;
