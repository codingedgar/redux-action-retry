"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../core/index");
const ramda_1 = require("ramda");
const now_1 = require("../now");
exports.liveUntilKey = 'liveUntil';
function liveUntil(wrap, config) {
    return now_1.now().add(config.cache[wrap.action.type].timeToLive);
}
exports.liveUntil = liveUntil;
function TimeToLive(config) {
    return {
        actionWrapper(action) {
            return {
                [exports.liveUntilKey]: liveUntil(action, config)
            };
        },
        shouldRetryAction(_, cachedAction) {
            return now_1.now().isBefore(cachedAction[exports.liveUntilKey]);
        },
        reducer(state, action) {
            if (action.type === index_1.REDUX_ACTION_RETRY && action[index_1.RETRY_ALL]) {
                const valueOfNow = now_1.now();
                return ramda_1.over(index_1.cacheLens, ramda_1.reject(cachedAction => valueOfNow.isSameOrAfter(cachedAction[exports.liveUntilKey])), state);
            }
            return state;
        }
    };
}
exports.TimeToLive = TimeToLive;
