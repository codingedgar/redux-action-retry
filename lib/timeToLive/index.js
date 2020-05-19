"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeToLive = exports.liveUntil = exports.liveUntilKey = void 0;
const now_1 = require("../now");
const UpdatedProtocol_1 = require("../core/protocols/UpdatedProtocol");
const AppendProtocol_1 = require("../core/protocols/AppendProtocol");
const upsert_1 = require("../core/upsert");
const GarbageCollectorProtocol_1 = require("../core/protocols/GarbageCollectorProtocol");
exports.liveUntilKey = 'liveUntil';
function liveUntil(action, config) {
    return now_1.now().add(config.cache[action.type].timeToLive);
}
exports.liveUntil = liveUntil;
function TimeToLive(config) {
    return {
        [UpdatedProtocol_1.UPDATED_PROTOCOL]: (_, cachedAction) => ({
            [exports.liveUntilKey]: liveUntil(cachedAction.action, config)
        }),
        [AppendProtocol_1.APPENDED_PROTOCOL]: (action) => ({
            [exports.liveUntilKey]: liveUntil(action[upsert_1.UPSERTED], config)
        }),
        [GarbageCollectorProtocol_1.GARBAGE_COLLECTOR_PROTOCOL]: (cachedAction) => now_1.now().isSameOrAfter(cachedAction[exports.liveUntilKey]),
    };
}
exports.TimeToLive = TimeToLive;
