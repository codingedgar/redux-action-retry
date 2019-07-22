"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../core/index");
const ramda_1 = require("ramda");
const now_1 = require("../now");
const UPDATED_PROTOCOL_1 = require("../core/protocols/UPDATED_PROTOCOL");
const APPENDED_PROTOCOL_1 = require("../core/protocols/APPENDED_PROTOCOL");
const RETRY_ALL_PROTOCOL_1 = require("../core/protocols/RETRY_ALL_PROTOCOL");
const upsert_1 = require("../core/upsert");
const utils_1 = require("../core/utils");
exports.liveUntilKey = 'liveUntil';
function liveUntil(action, config) {
    return now_1.now().add(config.cache[action.type].timeToLive);
}
exports.liveUntil = liveUntil;
function TimeToLive(config) {
    return {
        [UPDATED_PROTOCOL_1.UPDATED_PROTOCOL]: (_, cachedAction) => ({
            [exports.liveUntilKey]: liveUntil(cachedAction.action, config)
        }),
        [APPENDED_PROTOCOL_1.APPENDED_PROTOCOL]: (action) => ({
            [exports.liveUntilKey]: liveUntil(action[upsert_1.UPSERTED], config)
        }),
        [RETRY_ALL_PROTOCOL_1.RETRY_ALL_PROTOCOL]: (_, cachedAction) => {
            return now_1.now().isBefore(cachedAction[exports.liveUntilKey]);
        },
        reducer: () => (state = index_1.INITIAL_STATE, action) => {
            if (action.type === index_1.REDUX_ACTION_RETRY && action[index_1.RETRY_ALL]) {
                const valueOfNow = now_1.now();
                return ramda_1.over(utils_1.cacheLens, ramda_1.reject(cachedAction => valueOfNow.isSameOrAfter(cachedAction[exports.liveUntilKey])), state);
            }
            return state;
        }
    };
}
exports.TimeToLive = TimeToLive;
