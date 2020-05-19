"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.times = exports.timesKey = void 0;
const UpdatedProtocol_1 = require("../core/protocols/UpdatedProtocol");
const AppendProtocol_1 = require("../core/protocols/AppendProtocol");
exports.timesKey = 'times';
function times(_) {
    return {
        [UpdatedProtocol_1.UPDATED_PROTOCOL]: (_, cachedAction) => {
            return {
                [exports.timesKey]: cachedAction.times + 1
            };
        },
        [AppendProtocol_1.APPENDED_PROTOCOL]: (_) => ({
            [exports.timesKey]: 0
        })
    };
}
exports.times = times;
