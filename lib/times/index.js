"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.timesKey = 'times';
function times(_) {
    return {
        actionWrapper(cachedAction) {
            return {
                [exports.timesKey]: ramda_1.has(exports.timesKey, cachedAction) ? cachedAction.times + 1 : 0
            };
        }
    };
}
exports.times = times;
