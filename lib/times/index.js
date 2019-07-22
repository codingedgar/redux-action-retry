"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UPDATED_PROTOCOL_1 = require("../core/protocols/UPDATED_PROTOCOL");
const APPENDED_PROTOCOL_1 = require("../core/protocols/APPENDED_PROTOCOL");
exports.timesKey = 'times';
function times(_) {
    return {
        [UPDATED_PROTOCOL_1.UPDATED_PROTOCOL]: (_, cachedAction) => {
            return {
                [exports.timesKey]: cachedAction.times + 1
            };
        },
        [APPENDED_PROTOCOL_1.APPENDED_PROTOCOL]: (_) => ({
            [exports.timesKey]: 0
        })
    };
}
exports.times = times;
